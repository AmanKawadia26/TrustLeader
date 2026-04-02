package trafficlight

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Rules: red if average of approved reviews < 2 (when there is at least one review).
// No reviews: orange (neutral).
// Green only if insurance_proof is true and not red (red wins when rating < 2).
// Otherwise orange (2+ stars, no insurance seal).
func Recalculate(ctx context.Context, pool *pgxpool.Pool, businessID, triggeredBy string) {
	var reviewCount int
	var avgRating *float64
	var currentLight string
	var insuranceProof bool

	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = 'approved'`, businessID).Scan(&reviewCount)
	_ = pool.QueryRow(ctx, `SELECT AVG(rating::float8) FROM reviews WHERE business_id = $1 AND status = 'approved'`, businessID).Scan(&avgRating)
	_ = pool.QueryRow(ctx, `SELECT traffic_light::text FROM businesses WHERE id = $1`, businessID).Scan(&currentLight)
	_ = pool.QueryRow(ctx, `SELECT insurance_proof FROM businesses WHERE id = $1`, businessID).Scan(&insuranceProof)

	avg := 0.0
	if avgRating != nil {
		avg = *avgRating
	}

	newLight := compute(reviewCount, avg, insuranceProof)

	var avgPtr interface{}
	if reviewCount > 0 {
		avgPtr = avg
	}
	_, _ = pool.Exec(ctx, `UPDATE businesses SET traffic_light = $2::traffic_light,
		review_count = $3, average_rating = $4, updated_at = NOW() WHERE id = $1`,
		businessID, newLight, reviewCount, avgPtr)

	if currentLight != "" && currentLight != newLight {
		_, _ = pool.Exec(ctx, `INSERT INTO traffic_light_audit (business_id, old_state, new_state, reason, triggered_by)
			VALUES ($1, $2, $3, $4, $5)`, businessID, currentLight, newLight,
			"Auto-computed", triggeredBy)
	}
}

func compute(reviewCount int, averageRating float64, insuranceProof bool) string {
	if reviewCount == 0 {
		return "orange"
	}
	if averageRating < 2.0 {
		return "red"
	}
	if insuranceProof {
		return "green"
	}
	return "orange"
}
