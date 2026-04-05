# Deploying TrustLeader (Vercel + Render)

## Why two hosts?

| Piece | Host | Reason |
|--------|------|--------|
| **Frontend** (`artifacts/trustleader`) | **Vercel** | Static/Vite build, CDN, preview URLs. |
| **Backend** (`backend/`, Go + Chi + Postgres) | **Render** (or Fly.io, Railway, etc.) | Long-lived HTTP server, DB connection pool, Dockerfile already in repo. |

**Vercel is not used for this Go API.** Vercel is built around serverless/edge functions; this API is a normal `http.Server` with middleware and Postgres. Running it on Vercel would require a redesign. Use Render (or similar) for the API.

## 1. Deploy the API on Render (do this first)

1. Push this repo to GitHub (already done if you deploy from Git).
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** (or **Web Service** with **Docker**).
3. Connect `AmanKawadia26/TrustLeader`, branch `main`.
4. Use [render.yaml](../render.yaml) at the repo root: Dockerfile path `./Dockerfile` (repo root). **Root Directory** must be **empty** so the build context includes `backend/`. If you instead set Root Directory to `backend`, use Dockerfile path `Dockerfile` and the file [backend/Dockerfile](../backend/Dockerfile) (context = `backend/` only).
5. In the service **Environment**, set at least:
   - `DATABASE_URL` – Supabase pooler or Postgres URI (see [SUPABASE.md](SUPABASE.md)).
   - `SUPABASE_JWT_SECRET` – JWT secret used to validate Supabase tokens (see [AUTH_AND_DB.md](AUTH_AND_DB.md)).
   - `SUPABASE_JWT_ISSUER` – if your deployment sets it (match `backend/.env.example`).
   - `CORS_ORIGINS` – comma-separated list of **origins allowed to call the API** (no trailing slash). After Vercel is live, include your production URL, e.g. `https://your-app.vercel.app`.
6. Wait for deploy; copy the public URL (e.g. `https://trustleader-api.onrender.com`).

**Health check:** `GET /api/healthz` (see [render.yaml](../render.yaml) `healthCheckPath`).

## 2. Deploy the frontend on Vercel

1. **New Project** → Import the same GitHub repo.
2. **Root Directory:** leave as **repository root** (monorepo). [vercel.json](../vercel.json) sets install/build/output.
3. **Framework Preset:** Other / Vite is fine; `vercel.json` overrides build output.
4. **Environment variables** (Production + Preview as needed):

   | Name | Example | Purpose |
   |------|---------|---------|
   | `VITE_API_URL` | `https://trustleader-api.onrender.com` | Base URL for the Go API (no `/api` suffix; client prefixes paths). |
   | `VITE_SUPABASE_URL` | From Supabase project | Auth. |
   | `VITE_SUPABASE_ANON_KEY` | From Supabase project | Auth. |

   Without `VITE_API_URL`, the app falls back to `window.location.origin`, so the browser would call your **Vercel** domain for `/api/...`, where no API exists.

5. Deploy. Then update **Render** `CORS_ORIGINS` to include your Vercel URL and redeploy the API if CORS was blocking.

## 3. Cursor MCP (Vercel / Render)

- **Vercel MCP** can list teams/projects; deployment is usually via Git integration or `vercel` CLI after `vercel link`.
- **Render MCP** requires you to **select a workspace** in the MCP UI before creating services; it does not replace linking the repo in the Render dashboard for Docker services.

## 4. Local vs production

- Local dev uses Vite proxy (`VITE_API_PROXY_TARGET`) to the Go server; production uses `VITE_API_URL` only (see [artifacts/trustleader/src/lib/api-setup.ts](../artifacts/trustleader/src/lib/api-setup.ts)).
