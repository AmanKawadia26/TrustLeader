package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	Pool *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
	if databaseURL == "" {
		return nil, errors.New("DATABASE_URL is required")
	}
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse db config: %w", err)
	}
	cfg.MaxConns = 32
	cfg.MinConns = 2
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping db: %w", err)
	}
	return &Store{Pool: pool}, nil
}

func (s *Store) Close() { s.Pool.Close() }

type Business struct {
	ID                     string
	Domain                 string
	Name                   string
	Description            *string
	TrafficLight           string
	GreenInsuranceEligible bool
	ReviewCount            int
	AverageRating          *float32
	CreatedAt              time.Time
	UpdatedAt              time.Time
}

type Review struct {
	ID              string
	BusinessID      string
	UserID          string
	Rating          int
	Text            string
	Status          string
	CompanyResponse *string
	BusinessName    *string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type User struct {
	ID          string
	Email       string
	Role        string
	BusinessID  *string
	ResellerID  *string
	CreatedAt   time.Time
}

type Referral struct {
	ID                string
	BusinessID        string
	BusinessName      string
	BusinessDomain    string
	Status            string
	CommissionAmount  float32
	CreatedAt         time.Time
}

func (s *Store) ListBusinesses(ctx context.Context, q string, page, limit int) ([]Business, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	base := `SELECT id, domain, name, description, traffic_light::text, green_insurance_eligible, review_count, average_rating, created_at, updated_at FROM businesses`
	order := ` ORDER BY review_count DESC NULLS LAST`
	var rows pgx.Rows
	var err error
	var total int
	if q != "" {
		pat := "%" + q + "%"
		err = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM businesses WHERE LOWER(name) LIKE LOWER($1) OR LOWER(domain) LIKE LOWER($1)`, pat).Scan(&total)
		if err != nil {
			return nil, 0, err
		}
		rows, err = s.Pool.Query(ctx, base+` WHERE LOWER(name) LIKE LOWER($1) OR LOWER(domain) LIKE LOWER($1)`+order+` LIMIT $2 OFFSET $3`, pat, limit, offset)
	} else {
		err = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM businesses`).Scan(&total)
		if err != nil {
			return nil, 0, err
		}
		rows, err = s.Pool.Query(ctx, base+order+` LIMIT $1 OFFSET $2`, limit, offset)
	}
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	return scanBusinesses(rows, total)
}

func scanBusinesses(rows pgx.Rows, total int) ([]Business, int, error) {
	var out []Business
	for rows.Next() {
		var b Business
		var tl string
		err := rows.Scan(&b.ID, &b.Domain, &b.Name, &b.Description, &tl, &b.GreenInsuranceEligible, &b.ReviewCount, &b.AverageRating, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		b.TrafficLight = tl
		out = append(out, b)
	}
	return out, total, rows.Err()
}

func (s *Store) GetBusiness(ctx context.Context, id string) (*Business, error) {
	row := s.Pool.QueryRow(ctx, `SELECT id, domain, name, description, traffic_light::text, green_insurance_eligible, review_count, average_rating, created_at, updated_at
		FROM businesses WHERE id = $1`, id)
	var b Business
	var tl string
	err := row.Scan(&b.ID, &b.Domain, &b.Name, &b.Description, &tl, &b.GreenInsuranceEligible, &b.ReviewCount, &b.AverageRating, &b.CreatedAt, &b.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	b.TrafficLight = tl
	return &b, nil
}

func (s *Store) ListBusinessReviewsPublic(ctx context.Context, businessID string, page, limit int) ([]Review, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	var total int
	err := s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = 'approved'`, businessID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	rows, err := s.Pool.Query(ctx, `SELECT id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at
		FROM reviews WHERE business_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT $2 OFFSET $3`, businessID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []Review
	for rows.Next() {
		var r Review
		err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, r)
	}
	return list, total, rows.Err()
}

func (s *Store) GetUser(ctx context.Context, id string) (*User, error) {
	row := s.Pool.QueryRow(ctx, `SELECT id, email, role::text, business_id, reseller_id, created_at FROM users WHERE id = $1`, id)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.Role, &u.BusinessID, &u.ResellerID, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) InsertUser(ctx context.Context, id, email, role string) (*User, error) {
	row := s.Pool.QueryRow(ctx, `INSERT INTO users (id, email, role) VALUES ($1, $2, $3::user_role)
		ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
		RETURNING id, email, role::text, business_id, reseller_id, created_at`, id, email, role)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.Role, &u.BusinessID, &u.ResellerID, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) BusinessExists(ctx context.Context, id string) (bool, error) {
	var n int
	err := s.Pool.QueryRow(ctx, `SELECT 1 FROM businesses WHERE id = $1`, id).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (s *Store) InsertReview(ctx context.Context, businessID, userID string, rating int, text string) (*Review, error) {
	row := s.Pool.QueryRow(ctx, `INSERT INTO reviews (business_id, user_id, rating, text, status)
		VALUES ($1, $2, $3, $4, 'pending') RETURNING id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at`,
		businessID, userID, rating, text)
	var r Review
	err := row.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Store) GetReviewOwned(ctx context.Context, reviewID, userID string) (*Review, error) {
	row := s.Pool.QueryRow(ctx, `SELECT id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at
		FROM reviews WHERE id = $1 AND user_id = $2`, reviewID, userID)
	var r Review
	err := row.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Store) UpdateReview(ctx context.Context, reviewID string, rating int, text string) (*Review, error) {
	row := s.Pool.QueryRow(ctx, `UPDATE reviews SET rating = $2, text = $3, status = 'pending', updated_at = NOW() WHERE id = $1
		RETURNING id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at`,
		reviewID, rating, text)
	var r Review
	err := row.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Store) ListCompanyReviews(ctx context.Context, businessID string, status *string, page, limit int) ([]Review, int, error) {
	offset := (page - 1) * limit
	var total int
	var rows pgx.Rows
	var err error
	if status != nil && *status != "" {
		err = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND status = $2::review_status`, businessID, *status).Scan(&total)
		if err != nil {
			return nil, 0, err
		}
		rows, err = s.Pool.Query(ctx, `SELECT id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at
			FROM reviews WHERE business_id = $1 AND status = $2::review_status ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
			businessID, *status, limit, offset)
	} else {
		err = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE business_id = $1`, businessID).Scan(&total)
		if err != nil {
			return nil, 0, err
		}
		rows, err = s.Pool.Query(ctx, `SELECT id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at
			FROM reviews WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, businessID, limit, offset)
	}
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []Review
	for rows.Next() {
		var r Review
		err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, r)
	}
	return list, total, rows.Err()
}

func (s *Store) UpdateCompanyResponse(ctx context.Context, reviewID, businessID, response string) (*Review, error) {
	row := s.Pool.QueryRow(ctx, `UPDATE reviews SET company_response = $3, updated_at = NOW()
		WHERE id = $1 AND business_id = $2 RETURNING id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at`,
		reviewID, businessID, response)
	var r Review
	err := row.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Store) ListConsumerReviews(ctx context.Context, userID string, page, limit int) ([]Review, int, error) {
	offset := (page - 1) * limit
	var total int
	_ = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM reviews WHERE user_id = $1`, userID).Scan(&total)
	rows, err := s.Pool.Query(ctx, `SELECT r.id, r.business_id, r.user_id, r.rating, r.text, r.status::text, r.company_response, r.created_at, r.updated_at, b.name
		FROM reviews r LEFT JOIN businesses b ON b.id = r.business_id WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []Review
	for rows.Next() {
		var r Review
		err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt, &r.BusinessName)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, r)
	}
	return list, total, rows.Err()
}

func (s *Store) GetResellerEarnings(ctx context.Context, resellerID string) (totalEarnings, pendingEarnings float64, err error) {
	e := s.Pool.QueryRow(ctx, `SELECT total_earnings, pending_earnings FROM resellers WHERE id = $1`, resellerID).Scan(&totalEarnings, &pendingEarnings)
	if errors.Is(e, pgx.ErrNoRows) {
		return 0, 0, nil
	}
	return totalEarnings, pendingEarnings, e
}

func (s *Store) CountReferrals(ctx context.Context, resellerID string, approvedOnly bool) (int, error) {
	var q string
	if approvedOnly {
		q = `SELECT COUNT(*) FROM referrals WHERE reseller_id = $1 AND status = 'approved'`
	} else {
		q = `SELECT COUNT(*) FROM referrals WHERE reseller_id = $1`
	}
	var n int
	err := s.Pool.QueryRow(ctx, q, resellerID).Scan(&n)
	return n, err
}

func (s *Store) ListReferrals(ctx context.Context, resellerID string, page, limit int) ([]Referral, int, error) {
	offset := (page - 1) * limit
	var total int
	_ = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM referrals WHERE reseller_id = $1`, resellerID).Scan(&total)
	rows, err := s.Pool.Query(ctx, `SELECT r.id, r.business_id, b.name, b.domain, r.status::text, r.commission_amount, r.created_at
		FROM referrals r JOIN businesses b ON b.id = r.business_id WHERE r.reseller_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
		resellerID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []Referral
	for rows.Next() {
		var r Referral
		err := rows.Scan(&r.ID, &r.BusinessID, &r.BusinessName, &r.BusinessDomain, &r.Status, &r.CommissionAmount, &r.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, r)
	}
	return list, total, rows.Err()
}
