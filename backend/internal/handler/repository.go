package handler

import (
	"context"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository is the data access surface used by HTTP handlers (implemented by *store.Store).
type Repository interface {
	ListBusinesses(ctx context.Context, q string, page, limit int) ([]store.Business, int, error)
	GetBusiness(ctx context.Context, id string) (*store.Business, error)
	ListBusinessReviewsPublic(ctx context.Context, businessID string, page, limit int) ([]store.Review, int, error)
	BusinessExists(ctx context.Context, id string) (bool, error)
	InsertReview(ctx context.Context, businessID, userID string, rating int, text string) (*store.Review, error)
	GetReviewOwned(ctx context.Context, reviewID, userID string) (*store.Review, error)
	UpdateReview(ctx context.Context, reviewID string, rating int, text string) (*store.Review, error)
	GetUser(ctx context.Context, id string) (*store.User, error)
	InsertUser(ctx context.Context, id, email, role string) (*store.User, error)
	ListCompanyReviews(ctx context.Context, businessID string, status *string, page, limit int) ([]store.Review, int, error)
	UpdateCompanyResponse(ctx context.Context, reviewID, businessID, response string) (*store.Review, error)
	ListConsumerReviews(ctx context.Context, userID string, page, limit int) ([]store.Review, int, error)
	GetResellerEarnings(ctx context.Context, resellerID string) (totalEarnings, pendingEarnings float64, err error)
	CountReferrals(ctx context.Context, resellerID string, approvedOnly bool) (int, error)
	ListReferrals(ctx context.Context, resellerID string, page, limit int) ([]store.Referral, int, error)
	ClaimBusiness(ctx context.Context, userID, businessID string) (*store.User, error)
	AdminListReviews(ctx context.Context, status *string, businessID *string, page, limit int) ([]store.Review, int, error)
	AdminSetReviewStatus(ctx context.Context, reviewID, status string) (*store.Review, error)
	UpdateBusinessOwned(ctx context.Context, userID string, name *string, description *string) (*store.Business, error)
	PgxPool() *pgxpool.Pool
}
