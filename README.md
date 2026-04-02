# TrustLeader

Trustleader.org monorepo: React frontend (`artifacts/trustleader`), shared OpenAPI contract (`lib/api-spec`), and a **Go** HTTP API (`backend/`) backed by **PostgreSQL** (Supabase).

## Prerequisites

- [pnpm](https://pnpm.io/) (required by root `package.json`)
- [Go 1.22+](https://go.dev/dl/)
- Supabase project: set `DATABASE_URL` (pooler connection string) and JWT settings for the API

## Quick start

### Database

Apply SQL migrations in `supabase/migrations/` to your Supabase project (`supabase db push` with CLI, or run SQL in the SQL editor). See [docs/SUPABASE.md](docs/SUPABASE.md) for verification steps and [docs/AUTH_AND_DB.md](docs/AUTH_AND_DB.md) for how `auth.users` maps to `public.users`.

Optional demo data: after migrations, run `supabase db seed` or `psql "$DATABASE_URL" -f supabase/seed.sql` (see `supabase/config.toml`).

### API (Go)

```bash
cd backend
cp .env.example .env   # fill DATABASE_URL, SUPABASE_JWT_SECRET, etc.
go run ./cmd/api
```

Server listens on `PORT` (default `8080`). Routes are mounted at **`/api`** (e.g. `GET /api/healthz`).

### Frontend

```bash
pnpm install
pnpm --filter @workspace/trustleader dev
```

Vite proxies `/api` to the Go server in development (see `artifacts/trustleader/vite.config.ts`). Copy `artifacts/trustleader/.env.example` to `.env` and set `VITE_SUPABASE_*` and optional `VITE_API_URL`.

## Layout

| Path | Purpose |
|------|---------|
| `artifacts/trustleader` | Vite + React app |
| `lib/api-spec` | OpenAPI 3.1 contract |
| `lib/api-client-react` | Generated TS client (Orval) |
| `lib/db` | Drizzle schema (reference for SQL migrations) |
| `backend/` | Production Go API (Chi, pgx, JWT, rate limits) |
| `supabase/migrations` | Postgres schema + RLS |

The legacy Node `artifacts/api-server` was removed from the pnpm workspace in favor of the Go service; historical Express sources can be recovered from git history if needed.

## Git SSH

This repo uses SSH with a dedicated key. `core.sshCommand` may be set to `ssh -i ~/.ssh/id_ed25519_enhanced_gpt -o IdentitiesOnly=yes`. See `.cursor/rules/git-ssh-enhanced-gpt.mdc`.
