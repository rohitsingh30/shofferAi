#!/bin/bash
# update-playwright-mcp.sh — Update the global @playwright/mcp installation
#
# Usage:
#   ./apps/playwright/scripts/update-playwright-mcp.sh          # update to latest
#   ./apps/playwright/scripts/update-playwright-mcp.sh 0.0.68   # pin specific version
#
# Why global install?
#   Using `npx -y @playwright/mcp@latest` caused slow/failed MCP server startups
#   because npx hits the npm registry EVERY time. The global binary starts instantly.

set -euo pipefail

VERSION="${1:-latest}"

echo "📦 Current version:"
playwright-mcp --version 2>/dev/null || echo "  (not installed)"

echo ""
echo "📥 Installing @playwright/mcp@${VERSION} globally..."
npm install -g "@playwright/mcp@${VERSION}"

echo ""
echo "✅ Updated version:"
playwright-mcp --version

echo ""
echo "🔄 Restart your CLI session to use the new version."
