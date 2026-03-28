package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string

const UserIDKey ctxKey = "userID"

func UserIDFromContext(ctx context.Context) (string, bool) {
	s, ok := ctx.Value(UserIDKey).(string)
	return s, ok
}

func SupabaseJWT(secret, expectedIssuer string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if secret == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "server_error", "message": "SUPABASE_JWT_SECRET not configured"})
				return
			}
			raw := r.Header.Get("Authorization")
			if !strings.HasPrefix(strings.ToLower(raw), "bearer ") {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing bearer token")
				return
			}
			tokenString := strings.TrimSpace(raw[7:])
			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(secret), nil
			}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
			if err != nil || !token.Valid {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "Invalid token")
				return
			}
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "Invalid claims")
				return
			}
			if expectedIssuer != "" {
				iss, _ := claims["iss"].(string)
				if iss != expectedIssuer {
					writeErr(w, http.StatusUnauthorized, "unauthorized", "Invalid issuer")
					return
				}
			}
			sub, _ := claims["sub"].(string)
			if sub == "" {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "Missing subject")
				return
			}
			ctx := context.WithValue(r.Context(), UserIDKey, sub)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeErr(w http.ResponseWriter, status int, code, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code, "message": msg})
}
