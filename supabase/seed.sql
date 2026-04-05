-- Demo data for local/staging. Run after migrations. Requires service role or direct Postgres (not anon).

INSERT INTO public.insurance_companies (id, name, slug, description, terms_url)
VALUES
  ('ic-markel-001', 'Markel Insurance', 'markel', 'Partner insurer for TrustLeader verified purchases.', 'https://example.com/markel-terms'),
  ('ic-hiscox-001', 'Hiscox Business Insurance', 'hiscox', 'Covers eligible transactions referred via TrustLeader.', 'https://example.com/hiscox-terms')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.users (id, email, role)
VALUES
  ('a0000001-0000-4000-8000-000000000001', 'reviewer1@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000002', 'reviewer2@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000003', 'reviewer3@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000004', 'reviewer4@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000005', 'reviewer5@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000006', 'chandu.shekar@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000007', 'm.r@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000008', 'ishan.mohamed@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000009', 'chems.wright@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000010', 'alex.k@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000011', 'priya.s@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000012', 'jordan.t@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000013', 'sam.lee@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000014', 'nina.v@example.com', 'consumer'),
  ('a0000001-0000-4000-8000-000000000015', 'omar.h@example.com', 'consumer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.businesses (
  id, domain, name, description, traffic_light, insurance_proof,
  insurance_company_id, listing_source, listing_status,
  review_count, average_rating, owner_user_id
)
VALUES
  (
    'b0000001-0000-4000-8000-000000000001',
    'hartwell-sons.example.com',
    'Hartwell & Sons',
    'Family-run electronics retailer with nationwide delivery.',
    'green',
    true,
    'ic-markel-001',
    'owner_claimed',
    'active',
    24,
    4.7,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000002',
    'pemberton-finance.example.com',
    'Pemberton Finance',
    'Independent mortgage and savings advice.',
    'orange',
    false,
    NULL,
    'import_scrape',
    'active',
    18,
    4.2,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000003',
    'cheap-gadgets.example.com',
    'Cheap Gadgets Ltd',
    'Discount electronics with mixed service history.',
    'red',
    false,
    NULL,
    'consumer_first_review',
    'active',
    12,
    1.4,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000004',
    'summit-travel.example.com',
    'Summit Travel Co',
    'Package holidays and city breaks.',
    'orange',
    false,
    NULL,
    'owner_claimed',
    'active',
    6,
    3.5,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000005',
    'greenleaf-insure.example.com',
    'Greenleaf Retail',
    'Home goods with insurer-backed checkout on TrustLeader.',
    'green',
    true,
    'ic-hiscox-001',
    'owner_claimed',
    'active',
    31,
    4.9,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000006',
    'new-shop.example.com',
    'New Shop (unreviewed)',
    'Recently listed; no approved reviews yet.',
    'orange',
    false,
    NULL,
    'import_scrape',
    'pending_verification',
    0,
    NULL,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000007',
    'thefundedroom.example.com',
    'The Funded Room',
    'Prop trading education and funded account challenges.',
    'orange',
    false,
    NULL,
    'owner_claimed',
    'active',
    8,
    3.1,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000008',
    'simplify-living.example.com',
    'Simplify Living',
    'Home organization and storage solutions.',
    'green',
    false,
    NULL,
    'owner_claimed',
    'active',
    42,
    4.8,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000009',
    'tempscb.example.com',
    'Tempscb',
    'Fast fashion and accessories online.',
    'red',
    false,
    NULL,
    'consumer_first_review',
    'active',
    15,
    2.0,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000010',
    'longevita.example.com',
    'Longevita Medical Travel',
    'Cosmetic surgery packages abroad.',
    'green',
    false,
    NULL,
    'owner_claimed',
    'active',
    56,
    4.6,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000011',
    'river-bank.example.com',
    'River Bank Digital',
    'Online banking and savings accounts.',
    'green',
    true,
    'ic-markel-001',
    'owner_claimed',
    'active',
    1120,
    4.5,
    NULL
  ),
  (
    'b0000001-0000-4000-8000-000000000012',
    'skyline-travel-insure.example.com',
    'Skyline Travel Insurance',
    'Annual multi-trip and single-trip cover.',
    'orange',
    false,
    NULL,
    'import_scrape',
    'active',
    34,
    3.9,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, business_id, user_id, rating, text, status)
VALUES
  ('r0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 5, 'Excellent service and fast delivery. Packaging was perfect.', 'approved'),
  ('r0000001-0000-4000-8000-000000000002', 'b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000002', 5, 'Great prices and helpful staff on the phone.', 'approved'),
  ('r0000001-0000-4000-8000-000000000003', 'b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000003', 4, 'Good experience overall; one item arrived a day late.', 'approved'),
  ('r0000001-0000-4000-8000-000000000004', 'b0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 4, 'Solid advice on remortgaging.', 'approved'),
  ('r0000001-0000-4000-8000-000000000005', 'b0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000002', 4, 'Professional team.', 'approved'),
  ('r0000001-0000-4000-8000-000000000006', 'b0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 1, 'Item broke after two days; no refund offered.', 'approved'),
  ('r0000001-0000-4000-8000-000000000007', 'b0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000002', 2, 'Slow support response.', 'approved'),
  ('r0000001-0000-4000-8000-000000000008', 'b0000001-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000003', 4, 'Nice trip; hotel was fine.', 'approved'),
  ('r0000001-0000-4000-8000-000000000009', 'b0000001-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000001', 5, 'Smooth purchase; insurance option clearly explained.', 'approved'),
  ('r0000001-0000-4000-8000-000000000010', 'b0000001-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000004', 5, 'Would use again.', 'approved'),
  ('r0000001-0000-4000-8000-000000000011', 'b0000001-0000-4000-8000-000000000007', 'a0000001-0000-4000-8000-000000000006', 1, 'I have made multiple attempts to contact you through Instagram, Telegram, and email with no response. My payout was supposed to arrive last week.', 'approved'),
  ('r0000001-0000-4000-8000-000000000012', 'b0000001-0000-4000-8000-000000000008', 'a0000001-0000-4000-8000-000000000007', 5, 'The website is easy to access. The products were very easy to locate and checkout was smooth. Delivery arrived two days early.', 'approved'),
  ('r0000001-0000-4000-8000-000000000013', 'b0000001-0000-4000-8000-000000000009', 'a0000001-0000-4000-8000-000000000008', 1, 'Never order on this fraudulent website. I placed my order on February 28 and still have no tracking number despite paying for express shipping.', 'approved'),
  ('r0000001-0000-4000-8000-000000000014', 'b0000001-0000-4000-8000-000000000010', 'a0000001-0000-4000-8000-000000000009', 5, 'I travelled for breast augmentation and lift with implants on 13 March and I am happy with the coordinator and the clinic. Clear communication throughout.', 'approved'),
  ('r0000001-0000-4000-8000-000000000015', 'b0000001-0000-4000-8000-000000000011', 'a0000001-0000-4000-8000-000000000010', 5, 'Opened an account in minutes. App is intuitive and transfers are instant. Customer chat resolved my question about limits same day.', 'approved'),
  ('r0000001-0000-4000-8000-000000000016', 'b0000001-0000-4000-8000-000000000011', 'a0000001-0000-4000-8000-000000000011', 4, 'Solid rates on the savings product. Took one star off because the card took ten days to arrive.', 'approved'),
  ('r0000001-0000-4000-8000-000000000017', 'b0000001-0000-4000-8000-000000000012', 'a0000001-0000-4000-8000-000000000012', 3, 'Policy documents were dense but claims line picked up quickly when I had a baggage delay.', 'approved'),
  ('r0000001-0000-4000-8000-000000000018', 'b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000013', 5, 'Ordered a laptop and a monitor; both were well packed and matched the listing exactly.', 'approved'),
  ('r0000001-0000-4000-8000-000000000019', 'b0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000014', 5, 'Clear fee structure and no pressure. We refinanced with confidence.', 'approved'),
  ('r0000001-0000-4000-8000-000000000020', 'b0000001-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000015', 4, 'City break package was good value. Hotel was central; one tour was rescheduled with notice.', 'approved'),
  ('r0000001-0000-4000-8000-000000000021', 'b0000001-0000-4000-8000-000000000008', 'a0000001-0000-4000-8000-000000000001', 5, 'Love the modular shelves; assembly instructions were clear and parts were labeled.', 'approved'),
  ('r0000001-0000-4000-8000-000000000022', 'b0000001-0000-4000-8000-000000000010', 'a0000001-0000-4000-8000-000000000002', 5, 'Aftercare team checked in daily for the first week. Airport transfer was punctual.', 'approved'),
  ('r0000001-0000-4000-8000-000000000023', 'b0000001-0000-4000-8000-000000000007', 'a0000001-0000-4000-8000-000000000003', 2, 'Course content was fine but the dashboard froze during the evaluation phase twice.', 'approved'),
  ('r0000001-0000-4000-8000-000000000024', 'b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000004', 5, 'Repeat customer. Warranty claim handled without fuss.', 'approved'),
  ('r0000001-0000-4000-8000-000000000025', 'b0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000005', 1, 'Charger stopped working after a week. Support refused a return because the box was opened.', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Align aggregates with seed reviews (recalc would do this at runtime)
UPDATE public.businesses b
SET
  review_count = s.c,
  average_rating = s.a::real
FROM (
  SELECT business_id, COUNT(*)::int AS c, AVG(rating::float8) AS a
  FROM public.reviews
  WHERE status = 'approved'
  GROUP BY business_id
) s
WHERE b.id = s.business_id;

UPDATE public.businesses SET traffic_light = 'red'::public.traffic_light
WHERE id IN (
  'b0000001-0000-4000-8000-000000000003',
  'b0000001-0000-4000-8000-000000000009'
);

UPDATE public.businesses SET traffic_light = 'orange'::public.traffic_light
WHERE id IN (
  'b0000001-0000-4000-8000-000000000002',
  'b0000001-0000-4000-8000-000000000004',
  'b0000001-0000-4000-8000-000000000006',
  'b0000001-0000-4000-8000-000000000007',
  'b0000001-0000-4000-8000-000000000012'
);

UPDATE public.businesses SET traffic_light = 'green'::public.traffic_light
WHERE id IN (
  'b0000001-0000-4000-8000-000000000001',
  'b0000001-0000-4000-8000-000000000005',
  'b0000001-0000-4000-8000-000000000008',
  'b0000001-0000-4000-8000-000000000010',
  'b0000001-0000-4000-8000-000000000011'
);

-- Demo reseller + referrals (JWT user must exist in auth.users with same id for API tests)
INSERT INTO public.users (id, email, role)
VALUES ('a0000001-0000-4000-8000-000000000099', 'reseller-demo@example.com', 'reseller')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resellers (id, user_id, total_earnings, pending_earnings)
VALUES ('res00001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000099', 1250.50, 120.00)
ON CONFLICT (id) DO NOTHING;

UPDATE public.users
SET reseller_id = 'res00001-0000-4000-8000-000000000001'
WHERE id = 'a0000001-0000-4000-8000-000000000099';

INSERT INTO public.referrals (id, reseller_id, business_id, status, commission_amount)
VALUES
  ('ref00001-0000-4000-8000-000000000001', 'res00001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'approved', 95.00),
  ('ref00002-0000-4000-8000-000000000002', 'res00001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000002', 'paid', 210.00),
  ('ref00003-0000-4000-8000-000000000003', 'res00001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000005', 'pending', 0.00)
ON CONFLICT (id) DO NOTHING;
