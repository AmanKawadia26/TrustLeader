-- Insurance companies, listing provenance, insurance_proof (replaces green_insurance_eligible semantics in API)

CREATE TYPE public.listing_source AS ENUM ('owner_claimed', 'import_scrape', 'consumer_first_review');
CREATE TYPE public.listing_status AS ENUM ('pending_verification', 'active', 'archived');

CREATE TABLE public.insurance_companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  terms_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insurance_companies_slug_lower ON public.insurance_companies (LOWER(slug));

ALTER TABLE public.businesses
  ADD COLUMN insurance_company_id TEXT REFERENCES public.insurance_companies(id) ON DELETE SET NULL,
  ADD COLUMN insurance_proof BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN insurance_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN listing_source public.listing_source NOT NULL DEFAULT 'import_scrape',
  ADD COLUMN listing_status public.listing_status NOT NULL DEFAULT 'active';

-- Carry forward legacy flag into insurance_proof, then drop old column
UPDATE public.businesses SET insurance_proof = green_insurance_eligible WHERE green_insurance_eligible = true;

ALTER TABLE public.businesses DROP COLUMN green_insurance_eligible;

CREATE INDEX idx_businesses_insurance_company_id ON public.businesses (insurance_company_id)
  WHERE insurance_company_id IS NOT NULL;

CREATE INDEX idx_businesses_listing ON public.businesses (listing_status, listing_source);

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY insurance_companies_select_all ON public.insurance_companies FOR SELECT USING (true);

-- Set public.users.role from signup metadata (intended_role: consumer | company | reseller)
CREATE OR REPLACE FUNCTION public.handle_tl_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.user_role := 'consumer';
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'intended_role', '') IN ('consumer', 'company', 'reseller', 'admin') THEN
    r := (NEW.raw_user_meta_data->>'intended_role')::public.user_role;
  END IF;
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id::text, COALESCE(NEW.email, ''), r)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;
