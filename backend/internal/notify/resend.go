package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/config"
)

type resendSender struct {
	cfg      config.Config
	client   *http.Client
	endpoint string // default https://api.resend.com/emails; tests may override
}

func newResend(cfg config.Config) *resendSender {
	return &resendSender{
		cfg: cfg,
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
		endpoint: "https://api.resend.com/emails",
	}
}

func (r *resendSender) SendReviewSubmitted(ctx context.Context, p ReviewSubmittedPayload) error {
	subject := fmt.Sprintf("New review for %s", p.BusinessName)
	plain := fmt.Sprintf(
		"A customer left a %d-star review for %s.\n\n%s\n\nReview ID: %s\n",
		p.Rating, p.BusinessName, p.ReviewExcerpt, p.ReviewID,
	)
	if p.DashboardURL != "" {
		plain += "\nView and respond: " + p.DashboardURL + "\n"
	}

	bn := html.EscapeString(p.BusinessName)
	ex := html.EscapeString(p.ReviewExcerpt)
	rid := html.EscapeString(p.ReviewID)
	var link string
	if p.DashboardURL != "" {
		u := html.EscapeString(p.DashboardURL)
		link = fmt.Sprintf(`<p><a href="%s">Open company dashboard</a></p>`, u)
	}
	htmlBody := fmt.Sprintf(
		`<p>A customer left a <strong>%d</strong>-star review for <strong>%s</strong>.</p>
<p style="white-space:pre-wrap;">%s</p>
<p style="color:#666;font-size:12px;">Review ID: %s</p>
%s`,
		p.Rating, bn, ex, rid, link,
	)

	body := map[string]interface{}{
		"from":    r.cfg.NotifyFromEmail,
		"to":      []string{p.ToEmail},
		"subject": subject,
		"html":    htmlBody,
		"text":    plain,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.endpoint, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+r.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var buf bytes.Buffer
		_, _ = buf.ReadFrom(resp.Body)
		return fmt.Errorf("resend: status %d: %s", resp.StatusCode, buf.String())
	}
	return nil
}
