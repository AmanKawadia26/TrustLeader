package trafficlight

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Recalculate(ctx context.Context, pool *pgxpool.Pool, businessID, triggeredBy string) {
	thirty := time.Now().AddDate(0, 0, -30)

	var reviewCount int
	var avgRating *float64
	var recentCount int
	var rejectedCount int
	var currentLight string

	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = 'approved'`, businessID).Scan(&reviewCount)
	_ = pool.QueryRow(ctx, `SELECT AVG(rating::float8) FROM reviews WHERE business_id = $1 AND status = 'approved'`, businessID).Scan(&avgRating)
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = 'approved' AND created_at >= $2`, businessID, thirty).Scan(&recentCount)
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = 'rejected'`, businessID).Scan(&rejectedCount)
	_ = pool.QueryRow(ctx, `SELECT traffic_light::text FROM businesses WHERE id = $1`, businessID).Scan(&currentLight)

	avg := 0.0
	if avgRating != nil {
		avg = *avgRating
	}

	newLight := compute(reviewCount, avg, recentCount, rejectedCount)
	greenEligible := newLight == "green" && reviewCount >= 10

	var avgPtr interface{}
	if reviewCount > 0 {
		avgPtr = avg
	}
	_, _ = pool.Exec(ctx, `UPDATE businesses SET traffic_light = $2::traffic_light, green_insurance_eligible = $3,
		review_count = $4, average_rating = $5, updated_at = NOW() WHERE id = $1`,
		businessID, newLight, greenEligible, reviewCount, avgPtr)

	if currentLight != "" && currentLight != newLight {
		_, _ = pool.Exec(ctx, `INSERT INTO traffic_light_audit (business_id, old_state, new_state, reason, triggered_by)
			VALUES ($1, $2, $3, $4, $5)`, businessID, currentLight, newLight,
			"Auto-computed", triggeredBy)
	}
}

func compute(reviewCount int, averageRating float64, recentReviewCount, flaggedCount int) string {
	if reviewCount == 0 {
		return "orange"
	}
	if flaggedCount > 3 || averageRating < 2.0 {
		return "red"
	}
	if averageRating >= 4.0 && reviewCount >= 5 && recentReviewCount >= 2 {
		return "green"
	}
	if averageRating >= 3.0 {
		return "orange"
	}
	return "red"
}
