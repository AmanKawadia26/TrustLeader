-- Default insurance partners referenced by the app and seed data.
-- Idempotent: safe if rows already exist (e.g. from supabase/seed.sql).

INSERT INTO public.insurance_companies (id, name, slug, description, terms_url)
VALUES
  (
    'ic-markel-001',
    'Markel Insurance',
    'markel',
    'Partner insurer for TrustLeader verified purchases.',
    'https://www.markel.com/'
  ),
  (
    'ic-hiscox-001',
    'Hiscox Business Insurance',
    'hiscox',
    'Covers eligible transactions referred via TrustLeader.',
    'https://www.hiscox.com/'
  )
ON CONFLICT (slug) DO NOTHING;
