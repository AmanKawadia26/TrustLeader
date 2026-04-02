#!/bin/sh
# Works with `sh` and `bash`. Prefer: ./start-backend.sh (after chmod +x)
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Create backend/.env (see backend/.env.example)."
  exit 1
fi

exec go run ./cmd/api
