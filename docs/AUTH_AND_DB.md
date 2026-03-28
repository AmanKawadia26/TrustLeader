# Auth and database model

## `public.users` and Supabase Auth

- `public.users.id` is the **same string as** `auth.users.id` (UUID). The Go API validates Supabase JWTs and uses `sub` as the user id.
- On **new signup**, `public.users` is populated by trigger `on_auth_user_created` (see migration), copying `id` and `email` with default role `consumer`.
- `GET /api/users/profile` upserts a row if the JWT is valid but no profile row exists yet (matches prior Express behavior).

## Connection strings

- **Go API** uses `DATABASE_URL` (prefer **Supabase pooler** URI, `?sslmode=require`). The server uses the **postgres** role or equivalent; it **bypasses RLS** like `service_role`, so all authorization is enforced in application code (JWT + role checks).

## Row Level Security

- RLS is enabled on public tables for defense in depth (e.g. direct PostgREST access). The React app should call the **Go API** with the user JWT, not write to Postgres directly for business logic.
