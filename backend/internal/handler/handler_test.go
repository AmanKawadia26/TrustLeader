package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
	"unicode/utf8"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/notify"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

func TestHealth(t *testing.T) {
	var api API
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/healthz", nil)
	api.Health(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d", rec.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["status"] != "ok" {
		t.Fatalf("unexpected body %#v", body)
	}
}

func TestFormatUser_IncludesRole(t *testing.T) {
	u := store.User{
		ID:        "1",
		Email:     "a@b.c",
		Role:      "consumer",
		CreatedAt: time.Date(2024, 1, 2, 3, 4, 5, 0, time.UTC),
	}
	m := formatUser(u)
	if m["role"] != "consumer" {
		t.Fatalf("role %v", m["role"])
	}
}

func testRouter(api *API) http.Handler {
	r := chi.NewRouter()
	r.Route("/api", func(r chi.Router) {
		api.Routes(r)
	})
	return r
}

func jwtBearer(secret, sub string) string {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": sub,
	})
	s, err := tok.SignedString([]byte(secret))
	if err != nil {
		panic(err)
	}
	return "Bearer " + s
}

func TestListBusinesses_EmptyShape(t *testing.T) {
	api := &API{
		Store: &stubRepo{},
		Cfg:   config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	arr, _ := body["businesses"].([]interface{})
	if arr == nil || len(arr) != 0 {
		t.Fatalf("businesses %#v", body["businesses"])
	}
	if body["total"].(float64) != 0 {
		t.Fatalf("total %#v", body["total"])
	}
}

func TestGetBusiness_NotFound(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			getBusiness: func(_ context.Context, _ string) (*store.Business, error) {
				return nil, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses/missing-id", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestGetBusiness_OK(t *testing.T) {
	ts := time.Date(2024, 3, 1, 12, 0, 0, 0, time.UTC)
	api := &API{
		Store: &stubRepo{
			getBusiness: func(_ context.Context, id string) (*store.Business, error) {
				if id != "biz-1" {
					return nil, nil
				}
				return &store.Business{
					ID:             "biz-1",
					Domain:         "example.com",
					Name:           "Example Co",
					TrafficLight:   "green",
					InsuranceProof: false,
					ListingSource:  "import_scrape",
					ListingStatus:  "active",
					ReviewCount:    3,
					CreatedAt:      ts,
					UpdatedAt:      ts,
				}, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses/biz-1", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d", rec.Code)
	}
	var m map[string]interface{}
	if err := json.NewDecoder(rec.Body).Decode(&m); err != nil {
		t.Fatal(err)
	}
	if m["id"] != "biz-1" || m["name"] != "Example Co" {
		t.Fatalf("body %#v", m)
	}
}

func TestClaimCompany_UnauthorizedWithoutToken(t *testing.T) {
	api := &API{
		Store: &stubRepo{},
		Cfg:   config.Config{SupabaseJWTSecret: "secret"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/dashboard/company/claim", strings.NewReader(`{"business_id":"x"}`))
	req.Header.Set("Content-Type", "application/json")
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestClaimCompany_ForbiddenWrongRole(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			claimBusiness: func(_ context.Context, _, _ string) (*store.User, error) {
				return nil, store.ErrClaimNotCompanyRole
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "secret"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/dashboard/company/claim", bytes.NewBufferString(`{"business_id":"b1"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", jwtBearer("secret", "user-1"))
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}
}

func TestReady_NoDatabasePool(t *testing.T) {
	api := &API{
		Store: &stubRepo{},
		Cfg:   config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/ready", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestAdminBusinesses_ForbiddenForNonAdmin(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			getUser: func(_ context.Context, id string) (*store.User, error) {
				return &store.User{ID: id, Role: "consumer"}, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "secret"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/dashboard/admin/businesses", nil)
	req.Header.Set("Authorization", jwtBearer("secret", "u1"))
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}
}

func TestAdminBusinesses_OKForAdmin(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			getUser: func(_ context.Context, id string) (*store.User, error) {
				return &store.User{ID: id, Role: "admin"}, nil
			},
			listBusinesses: func(_ context.Context, _ string, _, _ int) ([]store.Business, int, error) {
				return nil, 0, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "secret"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/dashboard/admin/businesses", nil)
	req.Header.Set("Authorization", jwtBearer("secret", "admin-1"))
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d", rec.Code)
	}
}

type recordingNotify struct {
	mu   sync.Mutex
	last *notify.ReviewSubmittedPayload
}

func (r *recordingNotify) SendReviewSubmitted(_ context.Context, p notify.ReviewSubmittedPayload) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.last = &p
	return nil
}

func TestNotifyOwnerNewReview_sends(t *testing.T) {
	rec := &recordingNotify{}
	api := &API{
		Store: &stubRepo{
			getBusinessOwnerForNotification: func(_ context.Context, _ string) (string, string, string, bool, error) {
				return "o1", "owner@test.com", "BizName", true, nil
			},
		},
		Cfg:    config.Config{PublicAppURL: "https://app.example.com"},
		Notify: rec,
	}
	api.notifyOwnerNewReview("reviewer-1", &store.Review{
		ID: "r1", BusinessID: "b1", UserID: "reviewer-1", Rating: 4, Text: "Good service here for the customer.",
	})
	rec.mu.Lock()
	defer rec.mu.Unlock()
	if rec.last == nil {
		t.Fatal("expected notify")
	}
	if rec.last.ToEmail != "owner@test.com" || rec.last.BusinessName != "BizName" {
		t.Fatalf("%+v", rec.last)
	}
	want := "https://app.example.com/dashboard/company"
	if rec.last.DashboardURL != want {
		t.Fatalf("dashboard URL %q want %q", rec.last.DashboardURL, want)
	}
}

func TestNotifyOwnerNewReview_skipsWhenOwnerIsReviewer(t *testing.T) {
	rec := &recordingNotify{}
	api := &API{
		Store: &stubRepo{
			getBusinessOwnerForNotification: func(_ context.Context, _ string) (string, string, string, bool, error) {
				return "same-user", "o@test.com", "B", true, nil
			},
		},
		Cfg:    config.Config{},
		Notify: rec,
	}
	api.notifyOwnerNewReview("same-user", &store.Review{BusinessID: "b1"})
	rec.mu.Lock()
	defer rec.mu.Unlock()
	if rec.last != nil {
		t.Fatal("should skip when owner reviews own business")
	}
}

func TestGetInsuranceCompany_NotFound(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			getInsuranceCompanyBySlug: func(_ context.Context, _ string) (*store.InsuranceCompany, error) {
				return nil, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/insurance-companies/unknown-co", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestGetInsuranceCompany_OK(t *testing.T) {
	f := 4.5
	api := &API{
		Store: &stubRepo{
			getInsuranceCompanyBySlug: func(_ context.Context, slug string) (*store.InsuranceCompany, error) {
				if slug != "acme-ins" {
					return nil, nil
				}
				return &store.InsuranceCompany{ID: "ic-1", Name: "Acme", Slug: "acme-ins"}, nil
			},
			getInsuranceCompanyStats: func(_ context.Context, id string) (store.InsuranceCompanyStats, error) {
				if id != "ic-1" {
					return store.InsuranceCompanyStats{}, nil
				}
				return store.InsuranceCompanyStats{PartnerBusinesses: 2, TotalReviews: 10, AverageRating: &f}, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/insurance-companies/acme-ins", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	ins := body["insurance"].(map[string]interface{})
	if ins["name"] != "Acme" {
		t.Fatalf("insurance %#v", ins)
	}
	stats := body["stats"].(map[string]interface{})
	if int(stats["partner_businesses"].(float64)) != 2 {
		t.Fatalf("stats %#v", stats)
	}
}

func TestListInsuranceCompanyBusinesses_NotFound(t *testing.T) {
	api := &API{
		Store: &stubRepo{
			getInsuranceCompanyBySlug: func(_ context.Context, _ string) (*store.InsuranceCompany, error) {
				return nil, nil
			},
		},
		Cfg: config.Config{SupabaseJWTSecret: "x"},
	}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/insurance-companies/missing/businesses", nil)
	testRouter(api).ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestExcerptReviewText(t *testing.T) {
	if excerptReviewText("short", 100) != "short" {
		t.Fatal()
	}
	long := strings.Repeat("a", 300)
	out := excerptReviewText(long, 50)
	if utf8.RuneCountInString(out) != 53 {
		t.Fatalf("got %d runes", utf8.RuneCountInString(out))
	}
	if !strings.HasSuffix(out, "...") {
		t.Fatalf("suffix %q", out)
	}
}
