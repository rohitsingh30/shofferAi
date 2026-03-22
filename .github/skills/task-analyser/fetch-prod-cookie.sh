#!/usr/bin/env bash
# Authenticate with ShofferAI prod and save session cookies.
# Usage: ./fetch-prod-cookie.sh [--force]
#
# Saves cookie jar to /tmp/shofferai-cookies.txt (curl -b compatible).
# Cookies are valid for 30 days; re-run with --force to refresh early.

set -euo pipefail

PROD_URL="https://shofferai-27188185100.asia-south1.run.app"
COOKIE_JAR="/tmp/shofferai-cookies.txt"
MAX_AGE_SECONDS=86400  # re-auth if cookie jar > 24h old

# ── Check if refresh needed ──────────────────────────────────────
if [[ "${1:-}" != "--force" ]] && [[ -f "$COOKIE_JAR" ]]; then
  age=$(( $(date +%s) - $(stat -f %m "$COOKIE_JAR" 2>/dev/null || stat -c %Y "$COOKIE_JAR" 2>/dev/null) ))
  if (( age < MAX_AGE_SECONDS )); then
    # Quick validation: try a lightweight admin call
    status=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" \
      "${PROD_URL}/api/admin/telemetry?view=overview" 2>/dev/null || echo "000")
    if [[ "$status" == "200" ]]; then
      echo "✅ Cookie jar valid (${age}s old). Use --force to refresh."
      exit 0
    fi
    echo "⚠️  Cookie jar exists but returned HTTP $status — refreshing..."
  else
    echo "⚠️  Cookie jar expired (${age}s old) — refreshing..."
  fi
fi

# ── Step 1: Ensure dev user exists ───────────────────────────────
echo "🔑 Ensuring dev user exists..."
curl -s -X POST "${PROD_URL}/api/auth/dev-login" \
  -H "Content-Type: application/json" > /dev/null

# ── Step 2: Get CSRF token ───────────────────────────────────────
echo "🔐 Fetching CSRF token..."
CSRF_RESP=$(curl -s -c "$COOKIE_JAR" "${PROD_URL}/api/auth/csrf")
CSRF_TOKEN=$(echo "$CSRF_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null)

if [[ -z "$CSRF_TOKEN" ]]; then
  echo "❌ Failed to get CSRF token. Response: $CSRF_RESP"
  exit 1
fi

# ── Step 3: Sign in with credentials ─────────────────────────────
echo "🔓 Signing in as demo@shofferai.com..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "${PROD_URL}/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF_TOKEN}&email=demo@shofferai.com&password=demo1234" \
  -L)

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "❌ Sign-in failed with HTTP $HTTP_CODE"
  exit 1
fi

# ── Step 4: Validate ─────────────────────────────────────────────
VAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" \
  "${PROD_URL}/api/admin/telemetry?view=overview" 2>/dev/null || echo "000")

if [[ "$VAL_CODE" == "200" ]]; then
  echo "✅ Authenticated! Cookie jar saved to $COOKIE_JAR"
else
  echo "❌ Auth succeeded but telemetry API returned HTTP $VAL_CODE"
  echo "   Cookie jar saved to $COOKIE_JAR — may need admin email whitelisting."
  exit 1
fi
