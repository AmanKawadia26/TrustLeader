# Supabase operations

## Verify migrations applied (remote project)

1. Install CLI: https://supabase.com/docs/guides/cli
2. From repo root: `supabase link --project-ref <YOUR_PROJECT_REF>`
3. `supabase migration list` — local files should appear as applied on the remote after `supabase db push`.

Without the CLI, use the Dashboard **Database** → **Migrations** history or run:

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

Compare versions to filenames under `supabase/migrations/`.

## Apply new migrations

```bash
supabase db push
```

## Load seed data (development)

```bash
supabase db seed
```

Or pipe SQL:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

Do not commit database passwords. Use the Supabase dashboard **SQL Editor** for one-off runs if preferred.

## Troubleshooting connections

- **IPv6 unreachable / `network is unreachable` on port 5432:** The direct host `db.<project>.supabase.co` often has only **AAAA** in DNS. Use the **Connection pooling** URI (transaction mode, port **6543**) from the Supabase dashboard, or fix IPv6 routing. See `backend/.env.example`.
- **DNS preference:** The Go API sets IPv4-first lookup by default (`backend/internal/dbconn`). Set `DATABASE_PREFER_IPV4=false` only if you need stock pgx behavior.
- **Rotate secrets** if the database password or JWT was exposed in chat or logs.
