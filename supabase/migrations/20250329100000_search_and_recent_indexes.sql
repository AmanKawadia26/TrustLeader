-- Faster substring search on businesses; fast recent approved reviews listing.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON public.businesses USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_businesses_domain_trgm ON public.businesses USING gin (domain gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_reviews_approved_created_at ON public.reviews (created_at DESC)
  WHERE status = 'approved';
