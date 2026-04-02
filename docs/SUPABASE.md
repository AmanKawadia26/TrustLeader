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
