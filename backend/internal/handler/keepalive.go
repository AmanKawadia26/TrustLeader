package handler

import (
	"net/http"
	"os"
	"time"
)

// KeepaliveCron is for external schedulers (e.g. every 14 minutes) so hosts that spin down
// idle services (e.g. Render free tier) keep receiving traffic. It also refreshes the
// in-memory recent-reviews cache from the database.
//
// If CRON_SECRET is set, the caller must send X-Cron-Secret: <secret> or ?secret=<secret>.
func (a *API) KeepaliveCron(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeErr(w, http.StatusMethodNotAllowed, "method_not_allowed", "GET only")
		return
	}
	if secret := os.Getenv("CRON_SECRET"); secret != "" {
		if r.Header.Get("X-Cron-Secret") != secret && r.URL.Query().Get("secret") != secret {
			writeErr(w, http.StatusUnauthorized, "unauthorized", "invalid or missing cron secret")
			return
		}
	}
	if a.Recent == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"status":           "ok",
			"recent_reviews":   "unavailable",
			"note":             "recent cache not configured",
		})
		return
	}
	if err := a.Recent.Refresh(r.Context()); err != nil {
		writeErr(w, http.StatusInternalServerError, "server_error", err.Error())
		return
	}
	_, at := a.Recent.Snapshot()
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status":                      "ok",
		"recent_reviews_refreshed_at": at.UTC().Format(time.RFC3339Nano),
	})
}
