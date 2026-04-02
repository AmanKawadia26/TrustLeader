#!/bin/sh
# Load backend/.env and run the pgx connection smoke test.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

exec go run ./cmd/dbtest
