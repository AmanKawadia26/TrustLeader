package handler

import (
	"context"
	"errors"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/jackc/pgx/v5/pgxpool"
)

// stubRepo implements Repository with per-test overrides; unset methods return safe zero values.
type stubRepo struct {
	listBusinesses          func(ctx context.Context, q string, page, limit int) ([]store.Business, int, error)
	getBusiness             func(ctx context.Context, id string) (*store.Business, error)
	listBusinessReviewsPublic func(ctx context.Context, businessID string, page, limit int) ([]store.Review, int, error)
	businessExists          func(ctx context.Context, id string) (bool, error)
	insertReview            func(ctx context.Context, businessID, userID string, rating int, text string) (*store.Review, error)
	getReviewOwned          func(ctx context.Context, reviewID, userID string) (*store.Review, error)
	updateReview            func(ctx context.Context, reviewID string, rating int, text string) (*store.Review, error)
	getUser                 func(ctx context.Context, id string) (*store.User, error)
	insertUser              func(ctx context.Context, id, email, role string) (*store.User, error)
	listCompanyReviews      func(ctx context.Context, businessID string, status *string, page, limit int) ([]store.Review, int, error)
	updateCompanyResponse   func(ctx context.Context, reviewID, businessID, response string) (*store.Review, error)
	listConsumerReviews     func(ctx context.Context, userID string, page, limit int) ([]store.Review, int, error)
	getResellerEarnings     func(ctx context.Context, resellerID string) (totalEarnings, pendingEarnings float64, err error)
	countReferrals          func(ctx context.Context, resellerID string, approvedOnly bool) (int, error)
	listReferrals           func(ctx context.Context, resellerID string, page, limit int) ([]store.Referral, int, error)
	claimBusiness           func(ctx context.Context, userID, businessID string) (*store.User, error)
	adminListReviews        func(ctx context.Context, status *string, businessID *string, page, limit int) ([]store.Review, int, error)
	adminSetReviewStatus    func(ctx context.Context, reviewID, status string) (*store.Review, error)
	updateBusinessOwned     func(ctx context.Context, userID string, name *string, description *string) (*store.Business, error)
	pgxPool                 func() *pgxpool.Pool
}

func (s *stubRepo) ListBusinesses(ctx context.Context, q string, page, limit int) ([]store.Business, int, error) {
	if s.listBusinesses != nil {
		return s.listBusinesses(ctx, q, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) GetBusiness(ctx context.Context, id string) (*store.Business, error) {
	if s.getBusiness != nil {
		return s.getBusiness(ctx, id)
	}
	return nil, nil
}

func (s *stubRepo) ListBusinessReviewsPublic(ctx context.Context, businessID string, page, limit int) ([]store.Review, int, error) {
	if s.listBusinessReviewsPublic != nil {
		return s.listBusinessReviewsPublic(ctx, businessID, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) BusinessExists(ctx context.Context, id string) (bool, error) {
	if s.businessExists != nil {
		return s.businessExists(ctx, id)
	}
	return false, nil
}

func (s *stubRepo) InsertReview(ctx context.Context, businessID, userID string, rating int, text string) (*store.Review, error) {
	if s.insertReview != nil {
		return s.insertReview(ctx, businessID, userID, rating, text)
	}
	return nil, errors.New("stub: InsertReview not configured")
}

func (s *stubRepo) GetReviewOwned(ctx context.Context, reviewID, userID string) (*store.Review, error) {
	if s.getReviewOwned != nil {
		return s.getReviewOwned(ctx, reviewID, userID)
	}
	return nil, nil
}

func (s *stubRepo) UpdateReview(ctx context.Context, reviewID string, rating int, text string) (*store.Review, error) {
	if s.updateReview != nil {
		return s.updateReview(ctx, reviewID, rating, text)
	}
	return nil, errors.New("stub: UpdateReview not configured")
}

func (s *stubRepo) GetUser(ctx context.Context, id string) (*store.User, error) {
	if s.getUser != nil {
		return s.getUser(ctx, id)
	}
	return nil, nil
}

func (s *stubRepo) InsertUser(ctx context.Context, id, email, role string) (*store.User, error) {
	if s.insertUser != nil {
		return s.insertUser(ctx, id, email, role)
	}
	return nil, errors.New("stub: InsertUser not configured")
}

func (s *stubRepo) ListCompanyReviews(ctx context.Context, businessID string, status *string, page, limit int) ([]store.Review, int, error) {
	if s.listCompanyReviews != nil {
		return s.listCompanyReviews(ctx, businessID, status, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) UpdateCompanyResponse(ctx context.Context, reviewID, businessID, response string) (*store.Review, error) {
	if s.updateCompanyResponse != nil {
		return s.updateCompanyResponse(ctx, reviewID, businessID, response)
	}
	return nil, errors.New("stub: UpdateCompanyResponse not configured")
}

func (s *stubRepo) ListConsumerReviews(ctx context.Context, userID string, page, limit int) ([]store.Review, int, error) {
	if s.listConsumerReviews != nil {
		return s.listConsumerReviews(ctx, userID, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) GetResellerEarnings(ctx context.Context, resellerID string) (float64, float64, error) {
	if s.getResellerEarnings != nil {
		return s.getResellerEarnings(ctx, resellerID)
	}
	return 0, 0, nil
}

func (s *stubRepo) CountReferrals(ctx context.Context, resellerID string, approvedOnly bool) (int, error) {
	if s.countReferrals != nil {
		return s.countReferrals(ctx, resellerID, approvedOnly)
	}
	return 0, nil
}

func (s *stubRepo) ListReferrals(ctx context.Context, resellerID string, page, limit int) ([]store.Referral, int, error) {
	if s.listReferrals != nil {
		return s.listReferrals(ctx, resellerID, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) ClaimBusiness(ctx context.Context, userID, businessID string) (*store.User, error) {
	if s.claimBusiness != nil {
		return s.claimBusiness(ctx, userID, businessID)
	}
	return nil, errors.New("stub: ClaimBusiness not configured")
}

func (s *stubRepo) AdminListReviews(ctx context.Context, status *string, businessID *string, page, limit int) ([]store.Review, int, error) {
	if s.adminListReviews != nil {
		return s.adminListReviews(ctx, status, businessID, page, limit)
	}
	return nil, 0, nil
}

func (s *stubRepo) AdminSetReviewStatus(ctx context.Context, reviewID, status string) (*store.Review, error) {
	if s.adminSetReviewStatus != nil {
		return s.adminSetReviewStatus(ctx, reviewID, status)
	}
	return nil, errors.New("stub: AdminSetReviewStatus not configured")
}

func (s *stubRepo) UpdateBusinessOwned(ctx context.Context, userID string, name *string, description *string) (*store.Business, error) {
	if s.updateBusinessOwned != nil {
		return s.updateBusinessOwned(ctx, userID, name, description)
	}
	return nil, errors.New("stub: UpdateBusinessOwned not configured")
}

func (s *stubRepo) PgxPool() *pgxpool.Pool {
	if s.pgxPool != nil {
		return s.pgxPool()
	}
	return nil
}
