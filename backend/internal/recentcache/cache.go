package recentcache

import (
	"context"
	"sync"
	"time"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/store"
)

const defaultLimit = 20

// Cache holds the latest snapshot of recent approved reviews (in-memory).
type Cache struct {
	store *store.Store
	mu    sync.RWMutex
	items []store.RecentReviewPublic
	at    time.Time
}

func New(st *store.Store) *Cache {
	return &Cache{store: st}
}

// Refresh loads recent reviews from the database into memory.
func (c *Cache) Refresh(ctx context.Context) error {
	list, err := c.store.ListRecentReviewsPublic(ctx, defaultLimit)
	if err != nil {
		return err
	}
	c.mu.Lock()
	c.items = list
	c.at = time.Now().UTC()
	c.mu.Unlock()
	return nil
}

// Snapshot returns a copy of cached items and when they were last refreshed.
func (c *Cache) Snapshot() ([]store.RecentReviewPublic, time.Time) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make([]store.RecentReviewPublic, len(c.items))
	copy(out, c.items)
	return out, c.at
}

// Loop runs Refresh on an interval until ctx is cancelled.
func (c *Cache) Loop(ctx context.Context, interval time.Duration) {
	if interval < time.Minute {
		interval = time.Hour
	}
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			_ = c.Refresh(context.Background())
		}
	}
}
