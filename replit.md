# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Trustleader.org — a production-ready review platform with a traffic-light trust system (Red/Orange/Green).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + React Router v6 + React Query + react-i18next + framer-motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── trustleader/        # React + Vite frontend (Trustleader.org)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Core Features

### Traffic Light System
- Red: High Risk (avg < 2.0 or many flags)
- Orange: Caution (avg 2.0-4.0)
- Green: Strong Trust Signal (avg >= 4.0, 5+ reviews, recent activity)
- Auto-recalculated on every new/edited review
- Audit log stored in `traffic_light_audit` table

### Frontend Pages (artifacts/trustleader)
- `/` — Home with search, featured businesses
- `/business/:id` — Public business profile with TrafficLightBadge + MarkelGuaranteeBanner
- `/write-review/:businessId` — Post/edit reviews (auth required)
- `/auth/login` and `/auth/register` — Auth pages
- `/dashboard/company` — Company dashboard (reviews, respond, traffic light)
- `/dashboard/consumer` — Consumer dashboard (my reviews, edit)
- `/dashboard/reseller` — Reseller dashboard (referrals, earnings)

### Backend API (artifacts/api-server)
- `GET /api/healthz` — Health check
- `GET /api/businesses` — Search/list businesses
- `GET /api/businesses/:id` — Business profile
- `GET /api/businesses/:id/reviews` — Business reviews
- `POST /api/reviews` — Create review (auth)
- `PUT /api/reviews/:id` — Edit review (auth)
- `GET /api/dashboard/company/business` — Company's business
- `GET /api/dashboard/company/reviews` — Company reviews
- `POST /api/dashboard/company/respond` — Respond to review
- `GET /api/dashboard/consumer/reviews` — Consumer's own reviews
- `GET /api/dashboard/reseller/stats` — Reseller stats
- `GET /api/dashboard/reseller/referrals` — Referral list
- `GET /api/users/profile` — Current user profile

### Key Components
- `TrafficLightBadge` — 3 states (red/orange/green) with labels
- `MarkelGuaranteeBanner` — Shows only when traffic_light=green AND green_insurance_eligible=true
- `StarRating` — Clickable + display modes

## Database Schema (lib/db)
- `businesses` — domain, name, description, traffic_light, green_insurance_eligible, review_count, average_rating
- `users` — id, email, role (consumer/company/reseller/admin), business_id, reseller_id
- `reviews` — business_id, user_id, rating, text, status (pending/approved/rejected), company_response
- `traffic_light_audit` — audit log of traffic light changes
- `resellers` — earnings tracking
- `referrals` — referral tracking with commission amounts

## Auth
- JWT-based (decode token payload to extract `sub` as user ID)
- Auth header: `Authorization: Bearer <token>`
- User auto-created on first profile fetch
- Routes protected by `requireAuth` middleware

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

- **Always typecheck from the root** — run `pnpm run typecheck`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — full check across all packages
