#!/bin/bash

# Quick Local Demo Script
# Use this to quickly show a demo to your client locally

echo "🚀 Starting Softwrap POS Demo..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
    echo ""
fi

# Check if express is installed
if ! npm list express &>/dev/null; then
    echo "📦 Installing web server dependencies..."
    npm install express express-session
    echo ""
fi

echo "✅ Starting web server..."
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  🛒 Softwrap POS - Local Demo             ║"
echo "║                                            ║"
echo "║  Opening in browser in 3 seconds...       ║"
echo "║                                            ║"
echo "║  URL: http://localhost:3000                ║"
echo "║                                            ║"
echo "║  Login:                                    ║"
echo "║    Username: admin                         ║"
echo "║    Password: admin123                      ║"
echo "║                                            ║"
echo "║  Press Ctrl+C to stop                      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Open browser after 3 seconds (in background)
(sleep 3 && xdg-open http://localhost:3000 2>/dev/null || sensible-browser http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null) &

# Start server
npm run web

