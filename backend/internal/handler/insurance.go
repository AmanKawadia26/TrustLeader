package handler

import (
	"net/http"
	"strconv"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/go-chi/chi/v5"
)

// GetInsuranceCompany returns insurer detail and derived aggregate stats (public).
func (a *API) GetInsuranceCompany(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "slug is required")
		return
	}
	ic, err := a.Store.GetInsuranceCompanyBySlug(r.Context(), slug)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if ic == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Insurance company not found")
		return
	}
	stats, err := a.Store.GetInsuranceCompanyStats(r.Context(), ic.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"insurance": formatInsuranceCompanySummary(*ic),
		"stats":     formatInsuranceCompanyStats(stats),
	})
}

// ListInsuranceCompanyBusinesses paginates partner businesses for an insurer (public).
func (a *API) ListInsuranceCompanyBusinesses(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "slug is required")
		return
	}
	ic, err := a.Store.GetInsuranceCompanyBySlug(r.Context(), slug)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	if ic == nil {
		writeErr(w, http.StatusNotFound, "not_found", "Insurance company not found")
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
	list, total, err := a.Store.ListBusinessesByInsuranceCompanyID(r.Context(), ic.ID, page, limit)
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

func formatInsuranceCompanySummary(ic store.InsuranceCompany) map[string]interface{} {
	return map[string]interface{}{
		"id": ic.ID, "name": ic.Name, "slug": ic.Slug,
		"logo_url": ic.LogoURL, "description": ic.Description, "terms_url": ic.TermsURL,
	}
}

func formatInsuranceCompanyStats(s store.InsuranceCompanyStats) map[string]interface{} {
	m := map[string]interface{}{
		"partner_businesses": s.PartnerBusinesses,
		"total_reviews":      s.TotalReviews,
		"average_rating":     s.AverageRating,
	}
	return m
}
