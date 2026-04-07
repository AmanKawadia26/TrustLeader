package server

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/handler"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/recentcache"
	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

func New(cfg config.Config, st *store.Store, recent *recentcache.Cache) *http.Server {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)
			reqID := middleware.GetReqID(r.Context())
			log.Info("http_request",
				slog.String("request_id", reqID),
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", ww.Status()),
				slog.Int64("duration_ms", time.Since(start).Milliseconds()),
				slog.Int("bytes", ww.BytesWritten()),
			)
		})
	})
	r.Use(httprate.Limit(cfg.RateLimitPerMin, 1*time.Minute))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	api := &handler.API{Store: st, Cfg: cfg, Recent: recent}
	r.Route("/api", func(r chi.Router) {
		api.Routes(r)
	})

	return &http.Server{
		Addr:              cfg.Addr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
}
