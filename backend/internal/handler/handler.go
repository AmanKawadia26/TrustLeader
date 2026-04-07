package handler

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/middleware"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/recentcache"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/trafficlight"
	"github.com/go-chi/chi/v5"
)

type API struct {
	Store  Repository
	Cfg    config.Config
	Recent *recentcache.Cache
}

func (a *API) Routes(r chi.Router) {
	r.Get("/healthz", a.Health)
	r.Get("/ready", a.Ready)
	r.Get("/businesses", a.ListBusinesses)
	r.Get("/businesses/{id}", a.GetBusiness)
	r.Get("/businesses/{id}/reviews", a.GetBusinessReviews)
	r.Get("/reviews/recent", a.GetRecentReviews)
	r.Group(func(r chi.Router) {
		r.Use(middleware.SupabaseJWT(a.Cfg.SupabaseJWTSecret, a.Cfg.SupabaseJWTIssuer))
		r.Group(func(r chi.Router) {
			r.Use(adminOnly(a))
			r.Get("/dashboard/admin/businesses", a.AdminListBusinesses)
			r.Get("/dashboard/admin/reviews", a.AdminListReviews)
			r.Patch("/dashboard/admin/reviews/{id}", a.AdminSetReviewStatus)
		})
		r.Post("/reviews", a.CreateReview)
		r.Put("/reviews/{id}", a.UpdateReview)
		r.Get("/dashboard/company/business", a.GetCompanyBusiness)
		r.Patch("/dashboard/company/business", a.PatchCompanyBusiness)
		r.Get("/dashboard/company/reviews", a.GetCompanyReviews)
		r.Post("/dashboard/company/respond", a.RespondToReview)
		r.Post("/dashboard/company/claim", a.ClaimCompanyBusiness)
		r.Get("/dashboard/consumer/reviews", a.GetConsumerReviews)
		r.Get("/dashboard/reseller/stats", a.GetResellerStats)
		r.Get("/dashboard/reseller/referrals", a.GetResellerReferrals)
		r.Get("/users/profile", a.GetUserProfile)
	})
}

func (a *API) Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Ready reports whether the process can serve traffic that requires the database (pool ping).
func (a *API) Ready(w http.ResponseWriter, r *http.Request) {
	pool := a.Store.PgxPool()
	if pool == nil {
		writeErr(w, http.StatusServiceUnavailable, "unavailable", "database pool not configured")
		return
	}
	if err := pool.Ping(r.Context()); err != nil {
		writeErr(w, http.StatusServiceUnavailable, "unavailable", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (a *API) ListBusinesses(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.ListBusinesses(r.Context(), q, page, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, b := range list {
		out = append(out, formatBusiness(b))
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"businesses": out,
		"total":      total,
		"page":       page,
		"limit":      limit,
	})
}

func (a *API) GetBusiness(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	b, err := a.Store.GetBusiness(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if b == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Business not found")
		return
	}
	writeJSON(w, http.StatusOK, formatBusiness(*b))
}

func (a *API) GetBusinessReviews(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.ListBusinessReviewsPublic(r.Context(), id, page, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, rev := range list {
		out = append(out, formatReview(rev))
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": out,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

func (a *API) GetRecentReviews(w http.ResponseWriter, r *http.Request) {
	if a.Recent == nil {
		writeErr(w, http.StatusInternalServerError, "server_error", "recent reviews unavailable")
		return
	}
	items, at := a.Recent.Snapshot()
	out := make([]map[string]interface{}, 0, len(items))
	for _, it := range items {
		out = append(out, map[string]interface{}{
			"id":               it.ID,
			"rating":           it.Rating,
			"text":             it.Text,
			"reviewer_label":   it.ReviewerLabel,
			"business_id":      it.BusinessID,
			"business_name":    it.BusinessName,
			"business_domain":  it.BusinessDomain,
			"created_at":       it.CreatedAt.UTC().Format(time.RFC3339Nano),
		})
	}
	refreshed := ""
	if !at.IsZero() {
		refreshed = at.UTC().Format(time.RFC3339Nano)
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"reviews":       out,
		"refreshed_at":    refreshed,
	})
}

func (a *API) CreateReview(w http.ResponseWriter, r *http.Request) {
	uid, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing user")
		return
	}
	var body struct {
		BusinessID string `json:"business_id"`
		Rating     int    `json:"rating"`
		Text       string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "Invalid JSON")
		return
	}
	if len(strings.TrimSpace(body.Text)) < 10 {
		writeErr(w, http.StatusBadRequest, "bad_request", "text must be at least 10 characters")
		return
	}
	if body.Rating < 1 || body.Rating > 5 {
		writeErr(w, http.StatusBadRequest, "bad_request", "invalid rating")
		return
	}
	okBiz, err := a.Store.BusinessExists(r.Context(), body.BusinessID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if !okBiz {
		writeErr(w, http.StatusNotFound, "not_found", "Business not found")
		return
	}
	rev, err := a.Store.InsertReview(r.Context(), body.BusinessID, uid, body.Rating, body.Text)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	trafficlight.Recalculate(r.Context(), a.Store.PgxPool(), body.BusinessID, uid)
	writeJSON(w, http.StatusCreated, formatReview(*rev))
}

func (a *API) UpdateReview(w http.ResponseWriter, r *http.Request) {
	uid, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing user")
		return
	}
	id := chi.URLParam(r, "id")
	var body struct {
		Rating int    `json:"rating"`
		Text   string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "Invalid JSON")
		return
	}
	if len(strings.TrimSpace(body.Text)) < 10 {
		writeErr(w, http.StatusBadRequest, "bad_request", "text must be at least 10 characters")
		return
	}
	ex, err := a.Store.GetReviewOwned(r.Context(), id, uid)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if ex == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Review not found")
		return
	}
	rev, err := a.Store.UpdateReview(r.Context(), id, body.Rating, body.Text)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	trafficlight.Recalculate(r.Context(), a.Store.PgxPool(), ex.BusinessID, uid)
	writeJSON(w, http.StatusOK, formatReview(*rev))
}

func (a *API) GetCompanyBusiness(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.BusinessID == nil {
		writeErr(w, http.StatusNotFound, "not_found", "No business registered for this account")
		return
	}
	b, err := a.Store.GetBusiness(r.Context(), *u.BusinessID)
	if err != nil || b == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Business not found")
		return
	}
	writeJSON(w, http.StatusOK, formatBusiness(*b))
}

func (a *API) GetCompanyReviews(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.BusinessID == nil {
		writeErr(w, http.StatusForbidden, "forbidden", "No business associated with this account")
		return
	}
	status := r.URL.Query().Get("status")
	var st *string
	if status != "" {
		st = &status
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.ListCompanyReviews(r.Context(), *u.BusinessID, st, page, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, rev := range list {
		out = append(out, formatReview(rev))
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"reviews": out, "total": total, "page": page, "limit": limit})
}

func (a *API) RespondToReview(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.BusinessID == nil {
		writeErr(w, http.StatusForbidden, "forbidden", "No business associated with this account")
		return
	}
	var body struct {
		ReviewID string `json:"review_id"`
		Response string `json:"response"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "Invalid JSON")
		return
	}
	if strings.TrimSpace(body.Response) == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "response required")
		return
	}
	rev, err := a.Store.UpdateCompanyResponse(r.Context(), body.ReviewID, *u.BusinessID, body.Response)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if rev == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Review not found")
		return
	}
	writeJSON(w, http.StatusOK, formatReview(*rev))
}

func (a *API) GetConsumerReviews(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.ListConsumerReviews(r.Context(), uid, page, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, rev := range list {
		m := formatReview(rev)
		if rev.BusinessName != nil {
			m["business_name"] = *rev.BusinessName
		}
		out = append(out, m)
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"reviews": out, "total": total, "page": page, "limit": limit})
}

func (a *API) GetResellerStats(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.ResellerID == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"total_referrals": 0, "approved_referrals": 0, "pending_earnings": 0.0, "total_earnings": 0.0,
		})
		return
	}
	te, pe, err := a.Store.GetResellerEarnings(r.Context(), *u.ResellerID)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"total_referrals": 0, "approved_referrals": 0, "pending_earnings": 0.0, "total_earnings": 0.0,
		})
		return
	}
	totalRef, _ := a.Store.CountReferrals(r.Context(), *u.ResellerID, false)
	appr, _ := a.Store.CountReferrals(r.Context(), *u.ResellerID, true)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"total_referrals":    totalRef,
		"approved_referrals": appr,
		"pending_earnings":   pe,
		"total_earnings":     te,
	})
}

func (a *API) GetResellerReferrals(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.ResellerID == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{"referrals": []any{}, "total": 0, "page": 1, "limit": 20})
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.ListReferrals(r.Context(), *u.ResellerID, page, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, ref := range list {
		out = append(out, map[string]interface{}{
			"id": ref.ID, "business_id": ref.BusinessID, "business_name": ref.BusinessName, "business_domain": ref.BusinessDomain,
			"status": ref.Status, "commission_amount": ref.CommissionAmount, "created_at": ref.CreatedAt.Format("2006-01-02T15:04:05.000Z07:00"),
		})
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"referrals": out, "total": total, "page": page, "limit": limit})
}

func (a *API) ClaimCompanyBusiness(w http.ResponseWriter, r *http.Request) {
	uid, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing user")
		return
	}
	var body struct {
		BusinessID string `json:"business_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.BusinessID) == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "business_id is required")
		return
	}
	u, err := a.Store.ClaimBusiness(r.Context(), uid, strings.TrimSpace(body.BusinessID))
	if err != nil {
		switch {
		case errors.Is(err, store.ErrClaimNotCompanyRole):
			writeErr(w, http.StatusForbidden, "forbidden", err.Error())
		case errors.Is(err, store.ErrClaimAlreadyOtherBusiness):
			writeErr(w, http.StatusConflict, "conflict", err.Error())
		case errors.Is(err, store.ErrClaimBusinessTaken):
			writeErr(w, http.StatusConflict, "conflict", err.Error())
		case errors.Is(err, store.ErrClaimBusinessNotFound):
			writeErr(w, http.StatusNotFound, "not_found", err.Error())
		default:
			writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		}
		return
	}
	if u == nil {
		writeErr(w, http.StatusInternalServerError, "server_error", "user not found after claim")
		return
	}
	writeJSON(w, http.StatusOK, formatUser(*u))
}

func (a *API) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	uid, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing user")
		return
	}
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if u != nil {
		writeJSON(w, http.StatusOK, formatUser(*u))
		return
	}
	email := jwtEmail(r)
	if email == "" {
		writeErr(w, http.StatusNotFound, "not_found", "User not found")
		return
	}
	role := normalizeRole(intendedRoleFromJWT(r))
	nu, err := a.Store.InsertUser(r.Context(), uid, email, role)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, formatUser(*nu))
}

func intendedRoleFromJWT(r *http.Request) string {
	raw := r.Header.Get("Authorization")
	if !strings.HasPrefix(strings.ToLower(raw), "bearer ") {
		return ""
	}
	parts := strings.Split(strings.TrimSpace(raw[7:]), ".")
	if len(parts) != 3 {
		return ""
	}
	buf, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		buf, err = base64.StdEncoding.DecodeString(parts[1])
		if err != nil {
			return ""
		}
	}
	var m map[string]interface{}
	if json.Unmarshal(buf, &m) != nil {
		return ""
	}
	um, ok := m["user_metadata"].(map[string]interface{})
	if !ok {
		return ""
	}
	s, _ := um["intended_role"].(string)
	return s
}

func normalizeRole(s string) string {
	switch s {
	case "company", "consumer", "reseller", "admin":
		return s
	default:
		return "consumer"
	}
}

func jwtEmail(r *http.Request) string {
	raw := r.Header.Get("Authorization")
	if !strings.HasPrefix(strings.ToLower(raw), "bearer ") {
		return ""
	}
	parts := strings.Split(strings.TrimSpace(raw[7:]), ".")
	if len(parts) != 3 {
		return ""
	}
	buf, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		buf, err = base64.StdEncoding.DecodeString(parts[1])
		if err != nil {
			return ""
		}
	}
	var m map[string]interface{}
	if json.Unmarshal(buf, &m) != nil {
		return ""
	}
	if e, ok := m["email"].(string); ok {
		return e
	}
	return ""
}

func formatBusiness(b store.Business) map[string]interface{} {
	m := map[string]interface{}{
		"id":               b.ID,
		"domain":           b.Domain,
		"name":             b.Name,
		"description":      b.Description,
		"traffic_light":    b.TrafficLight,
		"insurance_proof":  b.InsuranceProof,
		"listing_source":   b.ListingSource,
		"listing_status":   b.ListingStatus,
		"review_count":     b.ReviewCount,
		"average_rating":   b.AverageRating,
		"created_at":       b.CreatedAt.UTC().Format(time.RFC3339Nano),
		"updated_at":       b.UpdatedAt.UTC().Format(time.RFC3339Nano),
	}
	if b.Insurance != nil {
		ic := b.Insurance
		m["insurance"] = map[string]interface{}{
			"id": ic.ID, "name": ic.Name, "slug": ic.Slug,
			"logo_url": ic.LogoURL, "description": ic.Description, "terms_url": ic.TermsURL,
		}
	} else {
		m["insurance"] = nil
	}
	return m
}

func formatReview(r store.Review) map[string]interface{} {
	m := map[string]interface{}{
		"id": r.ID, "business_id": r.BusinessID, "user_id": r.UserID, "rating": r.Rating, "text": r.Text,
		"status": r.Status, "company_response": r.CompanyResponse,
		"created_at": r.CreatedAt.UTC().Format(time.RFC3339Nano),
		"updated_at": r.UpdatedAt.UTC().Format(time.RFC3339Nano),
	}
	return m
}

func formatUser(u store.User) map[string]interface{} {
	return map[string]interface{}{
		"id": u.ID, "email": u.Email, "role": u.Role, "business_id": u.BusinessID, "reseller_id": u.ResellerID,
		"created_at": u.CreatedAt.UTC().Format(time.RFC3339Nano),
	}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, code, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code, "message": msg})
}
