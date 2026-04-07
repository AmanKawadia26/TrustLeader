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
   - **Optional — email owners on new reviews:** set `RESEND_API_KEY` and `NOTIFY_FROM_EMAIL` ([Resend](https://resend.com); verify your domain or use their test sender). Set `PUBLIC_APP_URL` to your Vercel app origin (no trailing slash) so notification emails link to `/dashboard/company`. If `RESEND_API_KEY` or `NOTIFY_FROM_EMAIL` is unset, the API does not send email.
6. Wait for deploy; copy the public URL (e.g. `https://trustleader-api.onrender.com`).

**Health check:** `GET /api/healthz` (see [render.yaml](../render.yaml) `healthCheckPath`).

## 2. Deploy the frontend on Vercel

Pick **one** layout (both are supported):

### Option A — Repository root (best if Vercel allows an empty Root Directory)

1. Import repo `AmanKawadia26/TrustLeader`, branch `main`.
2. **Root Directory:** leave **empty**.
3. [vercel.json](../vercel.json) at the repo root runs `pnpm --filter @workspace/trustleader build` and sets **output** to **`artifacts/trustleader/dist`**.
4. **Output Directory** in the dashboard: **empty** or **`artifacts/trustleader/dist`**. Do **not** use bare **`dist`** at repo root (there is no top-level `dist/`).

### Option B — Root Directory required (subfolder only)

If the UI forces a folder (no empty root), set:

1. **Root Directory:** **`artifacts/trustleader`** (the main app — **not** `artifacts/mockup-sandbox`).
2. [artifacts/trustleader/vercel.json](../artifacts/trustleader/vercel.json) runs install/build from the monorepo root (`cd ../.. && pnpm …`) and sets **output** to **`dist`** (i.e. `artifacts/trustleader/dist` on disk).
3. **Output Directory** in the dashboard: **empty** or **`dist`**. Do **not** use **`public`**.

Then continue:

1. **Framework Preset:** Vite or Other.
2. **Environment variables** (Production + Preview as needed):

   | Name | Example | Purpose |
   |------|---------|---------|
   | `VITE_API_URL` | `https://trustleader-api.onrender.com` | Base URL for the Go API (no `/api` suffix; client prefixes paths). |
   | `VITE_SUPABASE_URL` | From Supabase project | Auth. |
   | `VITE_SUPABASE_ANON_KEY` | From Supabase project | Auth. |

   Without `VITE_API_URL`, the app falls back to `window.location.origin`, so the browser would call your **Vercel** domain for `/api/...`, where no API exists.

3. Deploy. Then update **Render** `CORS_ORIGINS` to include your Vercel URL and redeploy the API if CORS was blocking.

If you see **“No Output Directory named … found”** after a successful `vite build`, clear **Output Directory** in project settings or match the path for your option: **`artifacts/trustleader/dist`** (Option A) or **`dist`** (Option B).

## 3. Cursor MCP (Vercel / Render)

- **Vercel MCP** can list teams/projects; deployment is usually via Git integration or `vercel` CLI after `vercel link`.
- **Render MCP** requires you to **select a workspace** in the MCP UI before creating services; it does not replace linking the repo in the Render dashboard for Docker services.

## 4. Local vs production

- Local dev uses Vite proxy (`VITE_API_PROXY_TARGET`) to the Go server; production uses `VITE_API_URL` only (see [artifacts/trustleader/src/lib/api-setup.ts](../artifacts/trustleader/src/lib/api-setup.ts)).
