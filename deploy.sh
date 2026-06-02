#!/bin/zsh
# One-step deploy for BlitzIQ.
# Commits everything in the repo and pushes to the branch GitHub Pages serves
# (narrow-build), which makes the change live at richderrik58.github.io/blitzIQ/.
# Usage:  ~/blitzIQ/deploy.sh "optional commit message"
cd ~/blitzIQ || exit 1
MSG="${1:-Update BlitzIQ $(date '+%Y-%m-%d %H:%M')}"
git add -A
if git commit -q -m "$MSG"; then
  echo "committed: $MSG"
else
  echo "Nothing new to deploy."
  exit 0
fi
if git push -q origin narrow-build; then
  echo "✅ Deployed. Live in ~2 minutes at https://richderrik58.github.io/blitzIQ/"
else
  echo "❌ Push failed — check your connection and try again."
  exit 1
fi
