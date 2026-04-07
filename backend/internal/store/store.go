package store

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/dbconn"
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
	dbconn.ApplyPreferIPv4(cfg.ConnConfig)
	cfg.MaxConns = 32
	cfg.MinConns = 2
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, dbconn.WrapPingError(fmt.Errorf("ping db: %w", err))
	}
	return &Store{Pool: pool}, nil
}

func (s *Store) Close() { s.Pool.Close() }

// PgxPool exposes the pool for traffic-light recalculation and readiness checks.
func (s *Store) PgxPool() *pgxpool.Pool { return s.Pool }

type InsuranceCompany struct {
	ID          string
	Name        string
	Slug        string
	LogoURL     *string
	Description *string
	TermsURL    *string
}

type Business struct {
	ID               string
	Domain           string
	Name             string
	Description      *string
	TrafficLight     string
	InsuranceProof   bool
	ListingSource    string
	ListingStatus    string
	InsuranceID      *string
	ReviewCount      int
	AverageRating    *float32
	CreatedAt        time.Time
	UpdatedAt        time.Time
	Insurance        *InsuranceCompany
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

// RecentReviewPublic is a denormalized row for the home page recent-reviews cache.
type RecentReviewPublic struct {
	ID             string
	Rating         int
	Text           string
	ReviewerLabel  string
	BusinessID     string
	BusinessName   string
	BusinessDomain string
	CreatedAt      time.Time
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
	base := `SELECT b.id, b.domain, b.name, b.description, b.traffic_light::text, b.insurance_proof,
		b.listing_source::text, b.listing_status::text, b.insurance_company_id, b.review_count, b.average_rating, b.created_at, b.updated_at,
		ic.id, ic.name, ic.slug, ic.logo_url, ic.description, ic.terms_url
		FROM businesses b
		LEFT JOIN insurance_companies ic ON ic.id = b.insurance_company_id`
	order := ` ORDER BY b.review_count DESC NULLS LAST`
	var rows pgx.Rows
	var err error
	var total int
	if q != "" {
		pat := "%" + q + "%"
		err = s.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM businesses WHERE name ILIKE $1 OR domain ILIKE $1`, pat).Scan(&total)
		if err != nil {
			return nil, 0, err
		}
		rows, err = s.Pool.Query(ctx, base+` WHERE b.name ILIKE $1 OR b.domain ILIKE $1`+order+` LIMIT $2 OFFSET $3`, pat, limit, offset)
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
		b, err := scanBusinessRow(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, b)
	}
	return out, total, rows.Err()
}

func scanBusinessRow(rows pgx.Rows) (Business, error) {
	var b Business
	var tl string
	var icID, icName, icSlug *string
	var icLogo, icDesc, icTerms *string
	err := rows.Scan(
		&b.ID, &b.Domain, &b.Name, &b.Description, &tl, &b.InsuranceProof,
		&b.ListingSource, &b.ListingStatus, &b.InsuranceID, &b.ReviewCount, &b.AverageRating, &b.CreatedAt, &b.UpdatedAt,
		&icID, &icName, &icSlug, &icLogo, &icDesc, &icTerms,
	)
	if err != nil {
		return Business{}, err
	}
	b.TrafficLight = tl
	if icID != nil && icName != nil && icSlug != nil {
		b.Insurance = &InsuranceCompany{
			ID: *icID, Name: *icName, Slug: *icSlug,
			LogoURL: icLogo, Description: icDesc, TermsURL: icTerms,
		}
	}
	return b, nil
}

func (s *Store) GetBusiness(ctx context.Context, id string) (*Business, error) {
	row := s.Pool.QueryRow(ctx, `SELECT b.id, b.domain, b.name, b.description, b.traffic_light::text, b.insurance_proof,
		b.listing_source::text, b.listing_status::text, b.insurance_company_id, b.review_count, b.average_rating, b.created_at, b.updated_at,
		ic.id, ic.name, ic.slug, ic.logo_url, ic.description, ic.terms_url
		FROM businesses b
		LEFT JOIN insurance_companies ic ON ic.id = b.insurance_company_id
		WHERE b.id = $1`, id)
	b, err := scanBusinessRowSingle(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func scanBusinessRowSingle(row pgx.Row) (Business, error) {
	var b Business
	var tl string
	var icID, icName, icSlug *string
	var icLogo, icDesc, icTerms *string
	err := row.Scan(
		&b.ID, &b.Domain, &b.Name, &b.Description, &tl, &b.InsuranceProof,
		&b.ListingSource, &b.ListingStatus, &b.InsuranceID, &b.ReviewCount, &b.AverageRating, &b.CreatedAt, &b.UpdatedAt,
		&icID, &icName, &icSlug, &icLogo, &icDesc, &icTerms,
	)
	if err != nil {
		return Business{}, err
	}
	b.TrafficLight = tl
	if icID != nil && icName != nil && icSlug != nil {
		b.Insurance = &InsuranceCompany{
			ID: *icID, Name: *icName, Slug: *icSlug,
			LogoURL: icLogo, Description: icDesc, TermsURL: icTerms,
		}
	}
	return b, nil
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

func (s *Store) ListRecentReviewsPublic(ctx context.Context, limit int) ([]RecentReviewPublic, error) {
	if limit < 1 || limit > 100 {
		limit = 20
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT r.id, r.rating, r.text, r.created_at,
			b.id, b.name, b.domain,
			NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), '')
		FROM reviews r
		INNER JOIN businesses b ON b.id = r.business_id
		INNER JOIN users u ON u.id = r.user_id
		WHERE r.status = 'approved'
		ORDER BY r.created_at DESC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []RecentReviewPublic
	for rows.Next() {
		var r RecentReviewPublic
		var label *string
		err := rows.Scan(&r.ID, &r.Rating, &r.Text, &r.CreatedAt, &r.BusinessID, &r.BusinessName, &r.BusinessDomain, &label)
		if err != nil {
			return nil, err
		}
		if label != nil && *label != "" {
			r.ReviewerLabel = *label
		} else {
			r.ReviewerLabel = "Reviewer"
		}
		list = append(list, r)
	}
	return list, rows.Err()
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

// ErrNoOwnedBusiness is returned when a user has no linked business for owner updates.
var ErrNoOwnedBusiness = errors.New("no business linked to this account")

// ErrEmptyBusinessName is returned when a PATCH supplies an empty name.
var ErrEmptyBusinessName = errors.New("name cannot be empty")

// AdminListReviews lists reviews across all businesses (optional status and business_id filters).
func (s *Store) AdminListReviews(ctx context.Context, status *string, businessID *string, page, limit int) ([]Review, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	var total int
	err := s.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM reviews r
		WHERE ($1::text IS NULL OR r.status::text = $1)
		AND ($2::text IS NULL OR r.business_id = $2)`, status, businessID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT r.id, r.business_id, r.user_id, r.rating, r.text, r.status::text, r.company_response, r.created_at, r.updated_at, b.name
		FROM reviews r
		JOIN businesses b ON b.id = r.business_id
		WHERE ($1::text IS NULL OR r.status::text = $1)
		AND ($2::text IS NULL OR r.business_id = $2)
		ORDER BY r.created_at DESC
		LIMIT $3 OFFSET $4`, status, businessID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []Review
	for rows.Next() {
		var r Review
		var bname string
		err := rows.Scan(&r.ID, &r.BusinessID, &r.UserID, &r.Rating, &r.Text, &r.Status, &r.CompanyResponse, &r.CreatedAt, &r.UpdatedAt, &bname)
		if err != nil {
			return nil, 0, err
		}
		r.BusinessName = &bname
		list = append(list, r)
	}
	return list, total, rows.Err()
}

// AdminSetReviewStatus sets moderation status (pending, approved, rejected).
func (s *Store) AdminSetReviewStatus(ctx context.Context, reviewID, status string) (*Review, error) {
	switch status {
	case "pending", "approved", "rejected":
	default:
		return nil, fmt.Errorf("invalid status %q", status)
	}
	row := s.Pool.QueryRow(ctx, `UPDATE reviews SET status = $2::review_status, updated_at = NOW() WHERE id = $1
		RETURNING id, business_id, user_id, rating, text, status::text, company_response, created_at, updated_at`,
		reviewID, status)
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

// UpdateBusinessOwned updates name and/or description for the business linked to the user (company owner).
func (s *Store) UpdateBusinessOwned(ctx context.Context, userID string, name *string, description *string) (*Business, error) {
	u, err := s.GetUser(ctx, userID)
	if err != nil || u == nil || u.BusinessID == nil {
		return nil, ErrNoOwnedBusiness
	}
	b, err := s.GetBusiness(ctx, *u.BusinessID)
	if err != nil || b == nil {
		return nil, err
	}
	newName := b.Name
	if name != nil {
		t := strings.TrimSpace(*name)
		if t == "" {
			return nil, ErrEmptyBusinessName
		}
		newName = t
	}
	var newDesc *string
	if description != nil {
		t := strings.TrimSpace(*description)
		if t == "" {
			newDesc = nil
		} else {
			newDesc = &t
		}
	} else {
		newDesc = b.Description
	}
	_, err = s.Pool.Exec(ctx, `UPDATE businesses SET name = $2, description = $3, updated_at = NOW() WHERE id = $1`,
		*u.BusinessID, newName, newDesc)
	if err != nil {
		return nil, err
	}
	return s.GetBusiness(ctx, *u.BusinessID)
}

// Claim errors for HTTP mapping.
var (
	ErrClaimNotCompanyRole       = errors.New("claim: user must have company role")
	ErrClaimAlreadyOtherBusiness = errors.New("claim: account is already linked to a different business")
	ErrClaimBusinessTaken        = errors.New("claim: this business is already linked to another account")
	ErrClaimBusinessNotFound     = errors.New("claim: business not found")
)

// ClaimBusiness links a company-role user to an existing business (owner claim).
// Idempotent if the user is already linked to the same business_id.
func (s *Store) ClaimBusiness(ctx context.Context, userID, businessID string) (*User, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var role string
	var existingBid *string
	err = tx.QueryRow(ctx, `SELECT role::text, business_id FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&role, &existingBid)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}
	if role != "company" {
		return nil, ErrClaimNotCompanyRole
	}
	if existingBid != nil {
		if *existingBid == businessID {
			if err := tx.Rollback(ctx); err != nil {
				return nil, err
			}
			return s.GetUser(ctx, userID)
		}
		return nil, ErrClaimAlreadyOtherBusiness
	}

	var one int
	err = tx.QueryRow(ctx, `SELECT 1 FROM businesses WHERE id = $1`, businessID).Scan(&one)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrClaimBusinessNotFound
	}
	if err != nil {
		return nil, err
	}

	var otherID string
	err = tx.QueryRow(ctx, `SELECT id FROM users WHERE business_id = $1 AND id <> $2 LIMIT 1`, businessID, userID).Scan(&otherID)
	if err == nil {
		return nil, ErrClaimBusinessTaken
	}
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `UPDATE users SET business_id = $1, updated_at = NOW() WHERE id = $2`, businessID, userID); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `UPDATE businesses SET owner_user_id = $1, listing_source = 'owner_claimed', updated_at = NOW() WHERE id = $2`, userID, businessID); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return s.GetUser(ctx, userID)
}
