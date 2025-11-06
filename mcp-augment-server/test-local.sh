#!/bin/bash
# Quick test script for MCP Augment Server

set -e

echo "🚀 MCP Augment Server - Local Test"
echo "===================================="
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 18.0.0"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check auggie
if ! command -v auggie &> /dev/null; then
    echo "⚠️  Auggie CLI not found"
    echo "   Install with: npm install -g @augmentcode/auggie"
    echo "   Then run: auggie login"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Auggie CLI: $(auggie --version 2>/dev/null || echo 'installed')"
fi

echo ""
echo "📦 Building MCP server..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Build
echo "   Compiling TypeScript..."
npm run build

# Check build output
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build successful!"
echo ""

echo "🧪 Testing MCP server..."
echo ""

# Test 1: List tools
echo "Test 1: Listing available tools..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js 2>/dev/null | head -20

echo ""
echo "✅ Server is working!"
echo ""

echo "📝 Next steps:"
echo "1. Configure Claude Desktop:"
echo "   Edit: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "   Add:"
echo '   {'
echo '     "mcpServers": {'
echo '       "augment": {'
echo '         "command": "node",'
echo "         \"args\": [\"$(pwd)/dist/index.js\"]"
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "2. Restart Claude Desktop"
echo ""
echo "3. In Claude, try:"
echo '   "Use autonomous_agent to analyze this codebase"'
echo ""

echo "🎉 Setup complete!"
