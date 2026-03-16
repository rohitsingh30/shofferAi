#!/bin/bash
# setup-chrome-pool.sh
# Creates N Chrome Pool slot directories with Profile 3 session data copied from Chrome-Debug.
#
# Usage: bash scripts/setup-chrome-pool.sh [pool_size]
# Default pool size: 3
#
# Run this before starting the relay server. Chrome-Debug must NOT be running.

set -euo pipefail

POOL_SIZE=${1:-3}
SRC_BASE="$HOME/Library/Application Support/Google/Chrome-Debug"
SRC_PROFILE="$SRC_BASE/Profile 3"
POOL_DIR="$HOME/Library/Application Support/Google/Chrome-Pool"

echo "=== ShofferAI Chrome Pool Setup ==="
echo "Source:    Chrome-Debug/Profile 3"
echo "Pool dir:  $POOL_DIR"
echo "Pool size: $POOL_SIZE"
echo ""

# 1. Verify source profile exists
if [ ! -d "$SRC_PROFILE" ]; then
    echo "ERROR: Source profile not found at: $SRC_PROFILE"
    echo "Start Chrome-Debug with Profile 3 first, sign in, then quit Chrome."
    exit 1
fi

# 2. Warn if Chrome-Debug is running (locks DBs)
if pgrep -f "Chrome-Debug" > /dev/null 2>&1; then
    echo "WARNING: Chrome-Debug appears to be running. Database files may be locked."
    echo "For best results, quit Chrome-Debug first, then re-run this script."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# 3. Kill any pool Chrome processes
echo "Stopping any running pool Chrome instances..."
for i in $(seq 0 $((POOL_SIZE - 1))); do
    PORT=$((9222 + i))
    if curl -s "http://localhost:${PORT}/json/version" > /dev/null 2>&1; then
        echo "  Killing Chrome on port $PORT..."
        lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
    fi
done
sleep 1

# Session files to copy
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

DIRS=(
    "Session Storage"
    "Local Storage"
    "IndexedDB"
    "Accounts"
)

# 4. Create each slot
for i in $(seq 0 $((POOL_SIZE - 1))); do
    SLOT_DIR="$POOL_DIR/slot-$i"
    DEST="$SLOT_DIR/Profile 3"

    echo ""
    echo "--- Slot $i ---"
    echo "  Dir:  $SLOT_DIR"
    echo "  Port: $((9222 + i))"

    mkdir -p "$DEST"

    # Remove singleton locks
    rm -f "$SLOT_DIR/SingletonLock" "$SLOT_DIR/SingletonSocket" "$SLOT_DIR/SingletonCookie"

    # Copy session files
    for f in "${FILES[@]}"; do
        if [ -f "$SRC_PROFILE/$f" ]; then
            mkdir -p "$(dirname "$DEST/$f")"
            cp -f "$SRC_PROFILE/$f" "$DEST/$f"
        fi
    done

    # Copy session directories
    for d in "${DIRS[@]}"; do
        if [ -d "$SRC_PROFILE/$d" ]; then
            rm -rf "$DEST/$d"
            cp -rf "$SRC_PROFILE/$d" "$DEST/$d"
        fi
    done

    # Verify booking.com cookies
    COOKIE_FILE=""
    if [ -f "$DEST/Cookies" ]; then
        COOKIE_FILE="$DEST/Cookies"
    elif [ -f "$DEST/Network/Cookies" ]; then
        COOKIE_FILE="$DEST/Network/Cookies"
    fi

    if [ -n "$COOKIE_FILE" ]; then
        BOOKING_COOKIES=$(sqlite3 "$COOKIE_FILE" "SELECT COUNT(*) FROM cookies WHERE host_key LIKE '%booking%';" 2>/dev/null || echo "0")
        echo "  Booking.com cookies: $BOOKING_COOKIES"
    else
        echo "  WARNING: No cookies database found"
    fi

    echo "  Done."
done

echo ""
echo "=== Pool setup complete ==="
echo "Next: Start the relay server with POOL_SIZE=$POOL_SIZE npm run laptop"
echo ""
