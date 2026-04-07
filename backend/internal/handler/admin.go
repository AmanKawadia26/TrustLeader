package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/middleware"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/trafficlight"
	"github.com/go-chi/chi/v5"
)

func adminOnly(a *API) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid, ok := middleware.UserIDFromContext(r.Context())
			if !ok {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing user")
				return
			}
			u, err := a.Store.GetUser(r.Context(), uid)
			if err != nil || u == nil || u.Role != "admin" {
				writeErr(w, http.StatusForbidden, "forbidden", "Admin access required")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// AdminListBusinesses lists all businesses (same query semantics as public list).
func (a *API) AdminListBusinesses(w http.ResponseWriter, r *http.Request) {
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

// AdminListReviews lists reviews across all businesses for moderation.
func (a *API) AdminListReviews(w http.ResponseWriter, r *http.Request) {
	st := r.URL.Query().Get("status")
	var stPtr *string
	if st != "" {
		stPtr = &st
	}
	bid := r.URL.Query().Get("business_id")
	var bidPtr *string
	if bid != "" {
		bidPtr = &bid
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	list, total, err := a.Store.AdminListReviews(r.Context(), stPtr, bidPtr, page, limit)
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
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": out,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

// AdminSetReviewStatus sets moderation status for a review (pending, approved, rejected).
func (a *API) AdminSetReviewStatus(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	id := chi.URLParam(r, "id")
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "Invalid JSON")
		return
	}
	body.Status = strings.TrimSpace(body.Status)
	if body.Status == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "status is required")
		return
	}
	rev, err := a.Store.AdminSetReviewStatus(r.Context(), id, body.Status)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if rev == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Review not found")
		return
	}
	trafficlight.Recalculate(r.Context(), a.Store.PgxPool(), rev.BusinessID, uid)
	writeJSON(w, http.StatusOK, formatReview(*rev))
}

// PatchCompanyBusiness updates the linked business name and/or description (company role).
func (a *API) PatchCompanyBusiness(w http.ResponseWriter, r *http.Request) {
	uid, _ := middleware.UserIDFromContext(r.Context())
	u, err := a.Store.GetUser(r.Context(), uid)
	if err != nil || u == nil || u.Role != "company" {
		writeErr(w, http.StatusForbidden, "forbidden", "Company account required")
		return
	}
	if u.BusinessID == nil {
		writeErr(w, http.StatusForbidden, "forbidden", "No business linked to this account")
		return
	}
	var body struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "Invalid JSON")
		return
	}
	if body.Name == nil && body.Description == nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "at least one of name, description is required")
		return
	}
	b, err := a.Store.UpdateBusinessOwned(r.Context(), uid, body.Name, body.Description)
	if err != nil {
		if errors.Is(err, store.ErrNoOwnedBusiness) {
			writeErr(w, http.StatusForbidden, "forbidden", err.Error())
			return
		}
		if errors.Is(err, store.ErrEmptyBusinessName) {
			writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
			return
		}
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if b == nil {
		writeErr(w, http.StatusInternalServerError, "server_error", "update failed")
		return
	}
	writeJSON(w, http.StatusOK, formatBusiness(*b))
}
