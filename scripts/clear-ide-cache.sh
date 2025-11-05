#!/bin/bash

# Script to clear IDE and TypeScript caches
# This helps resolve stale TypeScript language server errors

set -e

echo "🧹 Clearing IDE and TypeScript caches..."

# Clear TypeScript caches
echo "  → Clearing TypeScript caches..."
find . -type d -name ".tsbuildinfo" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.tsbuildinfo" -delete 2>/dev/null || true

# Clear node_modules caches
echo "  → Clearing node_modules caches..."
find . -path "*/node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Clear VS Code caches (if exists)
if [ -d ".vscode" ]; then
    echo "  → Clearing VS Code caches..."
    rm -rf .vscode/.tscache 2>/dev/null || true
fi

# Rebuild TypeScript projects
echo "  → Rebuilding TypeScript projects..."
npm run build --workspace @google/gemini-cli-core > /dev/null 2>&1
npm run build --workspace @google/gemini-cli > /dev/null 2>&1

# Rebuild bundle
echo "  → Rebuilding bundle..."
npm run bundle > /dev/null 2>&1

echo ""
echo "✅ Cache cleared successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. In VS Code: Cmd+Shift+P → 'TypeScript: Restart TS Server'"
echo "  2. Or: Cmd+Shift+P → 'Developer: Reload Window'"
echo "  3. Wait a few seconds for TypeScript to reindex"
echo ""
echo "The IDE errors should disappear after the TypeScript server restarts."
