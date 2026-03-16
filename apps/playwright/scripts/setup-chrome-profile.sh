#!/bin/bash
# setup-chrome-profile.sh
# Copies Chrome Profile 3 (rsinghtomar3011@gmail.com) session data into
# Chrome-Playwright/Default so Playwright MCP can use the signed-in profile.
#
# Usage: bash scripts/setup-chrome-profile.sh
# Run this before starting Claude Code if Chrome was used in between sessions.

set -euo pipefail

SRC="/Users/rohit/Library/Application Support/Google/Chrome/Profile 3"
DEST_BASE="/Users/rohit/Library/Application Support/Google/Chrome-Debug"
DEST="$DEST_BASE/Profile 3"

echo "=== ShofferAI Chrome Profile Setup ==="
echo "Source: Chrome/Profile 3 (rsinghtomar3011@gmail.com)"
echo "Target: Chrome-Debug/Profile 3"
echo ""

# 1. Check if Chrome is running (DBs are locked while Chrome runs)
if pgrep -x "Google Chrome" > /dev/null 2>&1; then
    echo "WARNING: Google Chrome is running. Database files may be locked."
    echo "For best results, quit Chrome first, then re-run this script."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# 2. Verify source profile exists
if [ ! -d "$SRC" ]; then
    echo "ERROR: Source profile not found at: $SRC"
    exit 1
fi

# 3. Ensure destination directories exist
mkdir -p "$DEST"

# 4. Remove stale singleton files (these block Playwright MCP from accessing the profile)
echo "Removing singleton lock files..."
rm -f "$DEST_BASE/SingletonLock" "$DEST_BASE/SingletonSocket" "$DEST_BASE/SingletonCookie"
echo "  Done."

# 5. Copy session-critical files from Profile 3 → Default
FILES=(
    "Cookies"
    "Cookies-journal"
    "Login Data"
    "Login Data-journal"
    "Web Data"
    "Web Data-journal"
    "Preferences"
    "Secure Preferences"
    "Network/Cookies"
    "Network/Cookies-journal"
)

echo "Copying session files..."
for f in "${FILES[@]}"; do
    if [ -f "$SRC/$f" ]; then
        # Ensure parent directory exists
        mkdir -p "$(dirname "$DEST/$f")"
        cp -f "$SRC/$f" "$DEST/$f"
        echo "  Copied: $f"
    else
        echo "  Skipped (not found): $f"
    fi
done

# 6. Also copy the Google account tokens and session storage
DIRS=(
    "Session Storage"
    "Local Storage"
    "IndexedDB"
    "Accounts"
)

echo "Copying session directories..."
for d in "${DIRS[@]}"; do
    if [ -d "$SRC/$d" ]; then
        rm -rf "$DEST/$d"
        cp -rf "$SRC/$d" "$DEST/$d"
        echo "  Copied: $d/"
    else
        echo "  Skipped (not found): $d/"
    fi
done

# 7. Verify booking.com cookies exist
echo ""
echo "Verifying booking.com session..."

# Try main Cookies file first, then Network/Cookies
COOKIE_FILE=""
if [ -f "$DEST/Cookies" ]; then
    COOKIE_FILE="$DEST/Cookies"
elif [ -f "$DEST/Network/Cookies" ]; then
    COOKIE_FILE="$DEST/Network/Cookies"
fi

if [ -n "$COOKIE_FILE" ]; then
    BOOKING_COOKIES=$(sqlite3 "$COOKIE_FILE" "SELECT COUNT(*) FROM cookies WHERE host_key LIKE '%booking%';" 2>/dev/null || echo "0")
    if [ "$BOOKING_COOKIES" -gt 0 ] 2>/dev/null; then
        echo "  Found $BOOKING_COOKIES booking.com cookies"
    else
        echo "  WARNING: No booking.com cookies found. You may need to:"
        echo "    1. Open Chrome with Profile 3"
        echo "    2. Visit booking.com and sign in"
        echo "    3. Close Chrome"
        echo "    4. Re-run this script"
    fi
else
    echo "  WARNING: Could not find Cookies database"
fi

echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "  1. Restart Claude Code (to restart Playwright MCP server)"
echo "  2. Playwright MCP will now use the signed-in profile"
echo ""
echo "TIP: Run this script again if the session expires or after using Chrome."
