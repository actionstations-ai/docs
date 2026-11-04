#!/usr/bin/env bash
# Build the docs and publish dist/ to the gh-pages branch of `origin`; GitHub Pages serves that
# branch at docs.actionstations.ai. No GitHub Actions: Pages deployments through Actions upload
# an artifact, and this project keeps GitHub free (no artifacts).
#
# Usage: scripts/deploy.sh                 docs from the latest app release tag
#        REF=main scripts/deploy.sh        docs from another ref of the app repository
#        DRY_RUN=1 scripts/deploy.sh       build and prepare the commit, but do not push
set -euo pipefail

DOMAIN="docs.actionstations.ai"
BRANCH="gh-pages"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree has uncommitted changes. Commit them so the deploy matches a commit." >&2
  exit 1
fi
git -C ../actionstations fetch --quiet --tags origin

echo "==> Tests"
pnpm test
echo "==> Sync from the app repository"
node scripts/sync-docs.mjs ${REF:+--ref "$REF"}
echo "==> Build"
pnpm exec astro build
echo "==> Links"
node scripts/check-links.mjs

SOURCE="$(git rev-parse --short HEAD)"
APP_REF="$(node -p "require('./src/content/docs/sync.json').ref")"
APP_SHA="$(node -p "require('./src/content/docs/sync.json').sha.slice(0, 8)")"
REMOTE_URL="$(git remote get-url origin)"

echo "$DOMAIN" > dist/CNAME
touch dist/.nojekyll

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
if git ls-remote --exit-code --heads "$REMOTE_URL" "$BRANCH" >/dev/null 2>&1; then
  git clone --quiet --depth 1 --branch "$BRANCH" --single-branch "$REMOTE_URL" "$WORK"
else
  git init --quiet -b "$BRANCH" "$WORK"
  git -C "$WORK" remote add origin "$REMOTE_URL"
fi
# Plain files on the Pages branch: GitHub Pages does not serve Git LFS objects.
git -C "$WORK" config lfs.fetchexclude '*'
find "$WORK" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$WORK"/
git -C "$WORK" add -A
if git -C "$WORK" diff --cached --quiet; then
  echo "Nothing changed since the last deploy."
  exit 0
fi
git -C "$WORK" commit --quiet -m "deploy: docs ${SOURCE} from app ${APP_REF} (${APP_SHA})"
if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1: commit prepared in $WORK, not pushed."
  trap - EXIT
  exit 0
fi
git -C "$WORK" push --quiet origin "$BRANCH"
echo "==> Published docs from app ${APP_REF}. GitHub Pages updates https://${DOMAIN}/ within a minute or two."
