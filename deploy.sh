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
  echo "No new edits to commit — pushing any unpushed commits."
fi
# Always push: covers both fresh edits and commits made outside this script
if git diff --quiet origin/narrow-build narrow-build 2>/dev/null; then
  echo "Already up to date with the live site. Nothing to deploy."
  exit 0
fi
if git push -q origin narrow-build; then
  echo "✅ Deployed. Live in ~2 minutes at https://richderrik58.github.io/blitzIQ/"
else
  echo "❌ Push failed — check your connection and try again."
  exit 1
fi
