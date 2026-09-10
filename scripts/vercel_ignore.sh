#!/usr/bin/env bash

# Vercel Build Ignore Script for 2-My-World (Planla)
# Exits with 0 to CANCEL / SKIP build.
# Exits with 1 to PROCEED with build.

COMMIT_REF="${VERCEL_GIT_COMMIT_REF:-}"
AUTHOR="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
COMMIT_MSG="${VERCEL_GIT_COMMIT_MESSAGE:-}"

echo "[VERCEL IGNORE CHECK] Branch: '$COMMIT_REF', Author: '$AUTHOR'"

# 1. Block any Jules branch or commit
if [[ "$COMMIT_REF" == jules-* ]] || [[ "$COMMIT_REF" == *jules* ]] || [[ "$COMMIT_REF" == palette-* ]] || [[ "$AUTHOR" == *jules* ]] || [[ "$AUTHOR" == *google-jules* ]]; then
  echo "[CANCEL BUILD] Jules branch or commit detected ($COMMIT_REF / $AUTHOR). Skipping Vercel build."
  exit 0
fi

# 2. Block non-main branch preview builds
if [[ "$COMMIT_REF" != "main" ]] && [[ -n "$COMMIT_REF" ]]; then
  echo "[CANCEL BUILD] Non-main branch ($COMMIT_REF). Skipping Vercel preview build."
  exit 0
fi

# 3. Check commit message for explicit skip flags
if [[ "$COMMIT_MSG" == *"[skip vercel]"* ]] || [[ "$COMMIT_MSG" == *"[no-deploy]"* ]] || [[ "$COMMIT_MSG" == *"[skip ci]"* ]]; then
  echo "[CANCEL BUILD] Commit message contains skip flag. Skipping Vercel build."
  exit 0
fi

# 4. Hard Gate: Only proceed if explicitly flagged with [deploy-vercel]
if [[ "$COMMIT_MSG" == *"[deploy-vercel]"* ]]; then
  echo "[PROCEED BUILD] Explicit [deploy-vercel] tag found. Proceeding with Vercel build."
  exit 1
fi

echo "[CANCEL BUILD] No [deploy-vercel] tag found. Skipping build to protect 10GB storage quota."
exit 0
