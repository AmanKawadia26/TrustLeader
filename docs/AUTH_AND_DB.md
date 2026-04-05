# Auth and database model

## `public.users` and Supabase Auth

- `public.users.id` is the **same string as** `auth.users.id` (UUID). The Go API validates Supabase JWTs and uses `sub` as the user id.
- On **new signup**, `public.users` is populated by trigger `on_tl_auth_user_created` (see migration), copying `id` and `email`. Role defaults to `consumer`, or is taken from `auth.users.raw_user_meta_data->>'intended_role'` when it is one of `consumer`, `company`, `reseller`, or `admin` (set by the app via Supabase `signUp` `options.data`).

## Traffic light (API + `businesses.traffic_light`)

Computed in Go (`internal/trafficlight`) after reviews change. Rules:

- **Red:** At least one **approved** review and average rating **&lt; 2** (red overrides insurance).
- **Orange:** No approved reviews yet, or average **≥ 2** but **`insurance_proof` is false**.
- **Green:** **`insurance_proof` is true**, average **≥ 2**, and not in the red case.

Insurer details are exposed on business payloads as `insurance` when `insurance_company_id` is set.
- `GET /api/users/profile` upserts a row if the JWT is valid but no profile row exists yet (matches prior Express behavior).

## Company accounts and `business_id`

- Dashboard endpoints under `/api/dashboard/company/*` require `public.users.business_id` to reference a row in `public.businesses`.
- **Claim (API):** `POST /api/dashboard/company/claim` with JSON `{ "business_id": "<uuid>" }` (Bearer JWT). Only users with `role = company` may call it. The business must exist, must not already be linked to another user, and the caller must not already be linked to a different business. On success, `users.business_id` is set and `businesses.owner_user_id` / `listing_source = owner_claimed` are updated.
- **Manual testing:** you can set `business_id` in SQL for a company user if you need to bypass the claim flow.

## Reseller demo data

- After `supabase/seed.sql`, user `a0000001-0000-4000-8000-000000000099` (`reseller-demo@example.com`) has `role = reseller` and a linked `resellers` row with sample `referrals`. For the Go API to authenticate this user, create a matching `auth.users` row (or sign up with Supabase using a fixed UUID via admin API). In development, use any reseller user whose `public.users.reseller_id` matches a row in `resellers`.

## Connection strings

- **Go API** uses `DATABASE_URL` (prefer **Supabase pooler** URI, `?sslmode=require`). The server uses the **postgres** role or equivalent; it **bypasses RLS** like `service_role`, so all authorization is enforced in application code (JWT + role checks).

## Row Level Security

- RLS is enabled on public tables for defense in depth (e.g. direct PostgREST access). The React app should call the **Go API** with the user JWT, not write to Postgres directly for business logic.
