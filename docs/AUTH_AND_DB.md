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

## Connection strings

- **Go API** uses `DATABASE_URL` (prefer **Supabase pooler** URI, `?sslmode=require`). The server uses the **postgres** role or equivalent; it **bypasses RLS** like `service_role`, so all authorization is enforced in application code (JWT + role checks).

## Row Level Security

- RLS is enabled on public tables for defense in depth (e.g. direct PostgREST access). The React app should call the **Go API** with the user JWT, not write to Postgres directly for business logic.
