#!/bin/zsh
# Usage (from Terminal):  ~/Documents/Videos/_engine/render.sh <slug> [--preview]
# Renders the job's plan.json with Remotion (needs to run outside Claude's sandbox).
set -e
cd "$(dirname "$0")"
SLUG="$1"; shift || true
[ -z "$SLUG" ] && { echo "usage: render.sh <slug> [--preview]"; exit 1; }
CMD=$(python3 scripts/pipeline.py render --slug "$SLUG" --dry "$@")
echo "▶ $CMD"
eval "$CMD"
echo "✅ done"
