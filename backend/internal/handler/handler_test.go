package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
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
