#!/usr/bin/env bash
set -euo pipefail

if rg -n "^(<<<<<<<|=======|>>>>>>>)" src supabase --glob '!dist/**' --glob '!node_modules/**'; then
  echo "\nConflict markers found. Resolve merge conflicts before committing."
  exit 1
fi

echo "No conflict markers found."
