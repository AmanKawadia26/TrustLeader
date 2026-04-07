package notify

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
)

func TestNewSender_NoopWithoutCredentials(t *testing.T) {
	s := NewSender(config.Config{})
	if _, ok := s.(Noop); !ok {
		t.Fatalf("expected Noop, got %T", s)
	}
}

func TestResendSender_SendReviewSubmitted(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/emails" {
			t.Errorf("got %s %s", r.Method, r.URL.Path)
		}
		if !strings.HasPrefix(r.Header.Get("Authorization"), "Bearer re_test_") {
			t.Errorf("Authorization %q", r.Header.Get("Authorization"))
		}
		b, _ := io.ReadAll(r.Body)
		var m map[string]interface{}
		if err := json.Unmarshal(b, &m); err != nil {
			t.Fatal(err)
		}
		if m["from"] != "TrustLeader <notify@example.com>" {
			t.Errorf("from %#v", m["from"])
		}
		to, _ := m["to"].([]interface{})
		if len(to) != 1 || to[0] != "owner@biz.com" {
			t.Errorf("to %#v", m["to"])
		}
		if m["subject"] != "New review for Acme Ltd" {
			t.Errorf("subject %#v", m["subject"])
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"id":"em_1"}`))
	}))
	defer srv.Close()

	rs := newResend(config.Config{
		ResendAPIKey:    "re_test_xxx",
		NotifyFromEmail: "TrustLeader <notify@example.com>",
		PublicAppURL:    "https://app.example.com",
	})
	rs.endpoint = srv.URL + "/emails"

	err := rs.SendReviewSubmitted(context.Background(), ReviewSubmittedPayload{
		ToEmail:       "owner@biz.com",
		BusinessName:  "Acme Ltd",
		Rating:        5,
		ReviewExcerpt: "Great service and fast delivery.",
		ReviewID:      "rev-1",
		DashboardURL:  "https://app.example.com/dashboard/company",
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestResendSender_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"message":"bad"}`))
	}))
	defer srv.Close()

	rs := newResend(config.Config{ResendAPIKey: "k", NotifyFromEmail: "a@b.c"})
	rs.endpoint = srv.URL + "/emails"
	err := rs.SendReviewSubmitted(context.Background(), ReviewSubmittedPayload{
		ToEmail: "x@y.com", BusinessName: "B", Rating: 1, ReviewExcerpt: "t", ReviewID: "1",
	})
	if err == nil || !strings.Contains(err.Error(), "401") {
		t.Fatalf("expected 401 error, got %v", err)
	}
}
