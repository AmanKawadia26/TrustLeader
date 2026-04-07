package notify

import (
	"context"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
)

// ReviewSubmittedPayload is sent when a consumer submits a new review (pending).
type ReviewSubmittedPayload struct {
	ToEmail       string
	BusinessName  string
	Rating        int
	ReviewExcerpt string
	ReviewID      string
	DashboardURL  string
}

// Sender delivers owner notifications (no-op when email is not configured).
type Sender interface {
	SendReviewSubmitted(ctx context.Context, p ReviewSubmittedPayload) error
}

// Noop does not send email.
type Noop struct{}

func (Noop) SendReviewSubmitted(context.Context, ReviewSubmittedPayload) error { return nil }

// NewSender returns a Resend-backed sender when RESEND_API_KEY and NOTIFY_FROM_EMAIL are set; otherwise Noop.
func NewSender(cfg config.Config) Sender {
	if cfg.ResendAPIKey == "" || cfg.NotifyFromEmail == "" {
		return Noop{}
	}
	return newResend(cfg)
}
