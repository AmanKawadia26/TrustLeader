-- TrustLeader initial schema (aligned with lib/db Drizzle definitions)

CREATE TYPE public.user_role AS ENUM ('consumer', 'company', 'reseller', 'admin');
CREATE TYPE public.traffic_light AS ENUM ('red', 'orange', 'green');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.referral_status AS ENUM ('pending', 'approved', 'paid');

CREATE TABLE public.businesses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  traffic_light public.traffic_light NOT NULL DEFAULT 'orange',
  green_insurance_eligible BOOLEAN NOT NULL DEFAULT false,
  review_count INTEGER NOT NULL DEFAULT 0,
  average_rating REAL,
  owner_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_name_lower ON public.businesses (LOWER(name));
CREATE INDEX idx_businesses_domain_lower ON public.businesses (LOWER(domain));

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'consumer',
  business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
  reseller_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.resellers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_earnings REAL NOT NULL DEFAULT 0,
  pending_earnings REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users
  ADD CONSTRAINT users_reseller_id_fkey
  FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON DELETE SET NULL;

CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  status public.review_status NOT NULL DEFAULT 'pending',
  company_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);

CREATE TABLE public.referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reseller_id TEXT NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  commission_amount REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_reseller ON public.referrals(reseller_id);

CREATE TABLE public.traffic_light_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  old_state TEXT,
  new_state TEXT NOT NULL,
  reason TEXT,
  triggered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_traffic_light_audit_business ON public.traffic_light_audit(business_id, created_at DESC);

-- Sync new auth users to public.users
CREATE OR REPLACE FUNCTION public.handle_tl_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id::text, COALESCE(NEW.email, ''), 'consumer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_tl_auth_user_created ON auth.users;
CREATE TRIGGER on_tl_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tl_new_user();

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_light_audit ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated role (adjust per product); service_role bypasses RLS.
CREATE POLICY businesses_select_all ON public.businesses FOR SELECT USING (true);
CREATE POLICY users_own_row ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY reviews_select_all ON public.reviews FOR SELECT USING (true);
CREATE POLICY resellers_select_own ON public.resellers FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY referrals_select_reseller ON public.referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.resellers r WHERE r.id = referrals.reseller_id AND r.user_id = auth.uid()::text)
);
