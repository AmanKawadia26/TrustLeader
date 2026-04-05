package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
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
