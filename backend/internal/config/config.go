package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Addr                    string
	DatabaseURL             string
	SupabaseJWTSecret       string
	SupabaseJWTIssuer       string
	CORSAllowedOrigins      []string
	RateLimitPerMin         int
	RecentReviewsInterval   time.Duration
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	rl := 120
	if s := os.Getenv("RATE_LIMIT_PER_MINUTE"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			rl = n
		}
	}
	origins := []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	if o := os.Getenv("CORS_ORIGINS"); o != "" {
		origins = strings.Split(o, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
	}
	ri := time.Hour
	if s := os.Getenv("RECENT_REVIEWS_INTERVAL"); s != "" {
		if d, err := time.ParseDuration(s); err == nil && d >= time.Minute {
			ri = d
		}
	}
	return Config{
		Addr:                  ":" + port,
		DatabaseURL:           os.Getenv("DATABASE_URL"),
		SupabaseJWTSecret:     os.Getenv("SUPABASE_JWT_SECRET"),
		SupabaseJWTIssuer:     os.Getenv("SUPABASE_JWT_ISSUER"),
		CORSAllowedOrigins:    origins,
		RateLimitPerMin:       rl,
		RecentReviewsInterval: ri,
	}
}
