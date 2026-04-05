# Frontend partner guide (TrustLeader API contract)

This document is for the **frontend team** building the TrustLeader web (or mobile) client. The **backend team** maintains the **Go HTTP API** in `backend/` and the **OpenAPI 3.1 contract** in [`lib/api-spec/openapi.yaml`](../lib/api-spec/openapi.yaml). Treat that file as the **source of truth** for request/response shapes; this guide summarizes how to call it and what to expect in production.

---

## 1. Division of ownership

| Area | Owner |
|------|--------|
| OpenAPI spec, Go routes, Postgres access, JWT validation, rate limits, CORS allowlist | Backend |
| React/Vite app UI/UX, routing, styling, i18n strings, Supabase **client** sign-in/sign-up | Frontend |
| Supabase Auth (users, email templates), database rows, RLS policies | Shared (ops + backend migrations) |

The React app should call **only the Go API** for business logic (listings, reviews, dashboards), not PostgREST on Supabase, unless you explicitly add a separate product path.

---

## 2. Base URL and environments

- **API path prefix:** every route is under **`/api`**. Example: `GET /api/healthz`, `GET /api/businesses`.
- **OpenAPI `servers.url`** is `/api`; generated clients use paths like `/healthz` and rely on a **base URL** that already includes `/api` **or** paths are combined correctly—verify in [`artifacts/trustleader/src/lib/api-setup.ts`](../artifacts/trustleader/src/lib/api-setup.ts).

### Development (Vite)

- Default: **`VITE_API_URL` unset** → `setBaseUrl(window.location.origin)` so requests go to `http://localhost:5173/api/...`.
- Vite [`vite.config.ts`](../artifacts/trustleader/vite.config.ts) **proxies** `/api` → `http://127.0.0.1:8080` (Go). Override with `VITE_API_PROXY_TARGET` if the API runs elsewhere.
- If the Go process is **down**, the proxy returns **503** JSON: `{ "error": "service_unavailable", "message": "API server is not reachable..." }`. The UI should handle this (toast, empty states).

### Production

- Set **`VITE_API_URL`** to the public origin that serves the API (e.g. `https://api.example.com`), **without** a trailing slash. The app prepends that origin to paths starting with `/`.
- Ensure the backend **`CORS_ORIGINS`** includes your web origin (see [`backend/internal/config`](../backend/internal/config/config.go) / `.env.example`).

---

## 3. Environment variables (frontend)

Copy from [`artifacts/trustleader/.env.example`](../artifacts/trustleader/.env.example):

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (public). |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (publishable) key for browser Auth client. |
| `VITE_API_URL` | No in dev | Omit to use same origin + Vite proxy. Set in prod to API origin. |
| `VITE_API_PROXY_TARGET` | No | Dev only: where Vite proxies `/api` (default `http://127.0.0.1:8080`). |

---

## 4. Authentication

- **Public routes:** `GET /api/healthz`, `GET /api/businesses`, `GET /api/businesses/{id}`, `GET /api/businesses/{id}/reviews`, `GET /api/reviews/recent` — **no** `Authorization` header.
- **Protected routes:** everything else in the table below — send **`Authorization: Bearer <access_token>`** where `<access_token>` is the Supabase session JWT (`supabase.auth.getSession()`).

The reference app registers a token getter in [`api-setup.ts`](../artifacts/trustleader/src/lib/api-setup.ts) via `setAuthTokenGetter` from `@workspace/api-client-react`.

**Backend requirement:** `SUPABASE_JWT_SECRET` must be set on the API. If it is **missing**, protected routes respond with **500** and a JSON error (`SUPABASE_JWT_SECRET not configured`).

**Signup metadata:** To assign roles, sign-up can pass `options.data.intended_role` with one of `consumer`, `company`, `reseller`, `admin` (see [`docs/AUTH_AND_DB.md`](AUTH_AND_DB.md)). The DB trigger maps this into `public.users.role`.

---

## 5. HTTP API summary (aligned with OpenAPI)

All paths below are relative to the **API root** including `/api` (e.g. full path `/api/businesses`).

| Method | Path | Auth | Summary |
|--------|------|------|---------|
| GET | `/healthz` | No | Liveness: `{ "status": "ok" }` |
| GET | `/businesses` | No | Query: `q`, `page`, `limit`. Returns `businesses`, `total`, `page`, `limit`. |
| GET | `/businesses/{id}` | No | Single **Business** (see schema: `traffic_light`, `insurance_proof`, `listing_source`, `listing_status`, nested `insurance`). |
| GET | `/businesses/{id}/reviews` | No | Public approved reviews (paged). |
| GET | `/reviews/recent` | No | Cached snapshot of recent **approved** reviews for home/marketing; includes `refreshed_at`. |
| POST | `/reviews` | Yes | Create review (`business_id`, `rating`, `text` min 10 chars). Typically `pending` moderation. |
| PUT | `/reviews/{id}` | Yes | Author updates their review. |
| GET | `/dashboard/company/business` | Yes (`company`) | Returns **Business** for the logged-in user’s `business_id`. |
| GET | `/dashboard/company/reviews` | Yes | Company’s reviews (optional `status` filter). |
| POST | `/dashboard/company/claim` | Yes (`company`) | Body: `{ "business_id": "<uuid>" }` — link account to an existing business; returns **UserProfile**. |
| POST | `/dashboard/company/respond` | Yes | Body: `review_id`, `response` — company reply. |
| GET | `/dashboard/consumer/reviews` | Yes | Consumer’s submitted reviews. |
| GET | `/dashboard/reseller/stats` | Yes (`reseller`) | Earnings and referral counts. |
| GET | `/dashboard/reseller/referrals` | Yes | Paged referrals. |
| GET | `/users/profile` | Yes | **UserProfile**: `id`, `email`, `role`, `business_id`, `reseller_id`, `created_at`. Creates/upserts profile if JWT valid but row missing. |

**Error JSON (common):** `{ "error": "<code>", "message": "<detail>" }` with appropriate status (400, 401, 403, 404, 500).

---

## 6. Domain rules the UI should reflect

### Business payload (`Business` in OpenAPI)

- **`traffic_light`:** `red` | `orange` | `green` — computed server-side from reviews + insurance (see [`docs/AUTH_AND_DB.md`](AUTH_AND_DB.md)).
- **`insurance_proof`:** boolean; **`insurance`:** insurer summary or `null`.
- **`listing_source`:** `owner_claimed` | `import_scrape` | `consumer_first_review`.
- **`listing_status`:** `pending_verification` | `active` | `archived`.

### Company dashboard

- `GET /api/dashboard/company/business` returns **404** if the user has **no** `business_id` (`"No business registered for this account"`). Use **`POST /api/dashboard/company/claim`** with the target business UUID (see OpenAPI **ClaimBusinessRequest**). **409** if the business is already linked to another user or the account is already linked to a different business. **403** if the JWT user is not `company` role.

### Reviews

- New reviews may be **`pending`** until moderated; public lists only show **approved** where applicable.

### Recent reviews

- `GET /api/reviews/recent` is suitable for a home page “recent activity” strip; payload includes anonymized **`reviewer_label`**, business name/domain, and timestamps.

---

## 7. Generated TypeScript client

- Package: **`@workspace/api-client-react`** ([`lib/api-client-react`](../lib/api-client-react/)).
- Regenerate when OpenAPI changes (from repo root, follow existing scripts—typically Orval against [`lib/api-spec/openapi.yaml`](../lib/api-spec/openapi.yaml)).

Use the generated hooks/functions (e.g. `getUserProfile`, `listBusinesses`, `listRecentReviews`) so types stay aligned with the backend.

---

## 8. What the backend team will deliver next (coordination)

When the backend adds or changes endpoints, they should:

1. Update [`lib/api-spec/openapi.yaml`](../lib/api-spec/openapi.yaml).
2. Regenerate the client and bump or communicate the change.
3. Document breaking changes here or in `CHANGELOG` if you introduce one.

Frontend should **not** hardcode response shapes that are not in OpenAPI; if something is missing, request an OpenAPI update.

---

## 9. Quick reference links

| Doc | Purpose |
|-----|---------|
| [`openapi.yaml`](../lib/api-spec/openapi.yaml) | Full schemas and operations |
| [`AUTH_AND_DB.md`](AUTH_AND_DB.md) | Users, roles, traffic light rules |
| [`SUPABASE.md`](SUPABASE.md) | DB connection, pooler, IPv6 notes |
| [`README.md`](../README.md) | Monorepo layout, how to run API and app |

---

## 10. Contact surface for integration issues

- **CORS errors:** check `CORS_ORIGINS` on API vs browser origin.
- **401 on all protected calls:** expired session, wrong JWT secret on API, or missing `Authorization` header.
- **503 in dev:** Go API not running on proxy target port.

This document should be updated whenever the **published OpenAPI** changes.
