#!/bin/bash

# Quick Demo Script - Run this when client asks to test
# This script starts the server and shows you how to share it

clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       🚀 QUICK CLIENT DEMO - STARTING SERVER...           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Setting up server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules/express" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install express express-session
    echo ""
fi

# Check if native modules need rebuilding
echo "🔧 Checking native modules..."
npm rebuild bcrypt better-sqlite3 > /dev/null 2>&1

echo "✅ Server is ready!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎯 OPTION 1: Local Testing (http://localhost:3000)"
echo ""
echo "   Starting server..."
echo "   Open: http://localhost:3000"
echo "   Login: admin / admin123"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 OPTION 2: Share with Client (Public URL)"
echo ""
echo "   In ANOTHER terminal, run:"
echo "   $ npx ngrok http 3000"
echo ""
echo "   Then send the ngrok URL to your client!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📱 Message to send client:"
echo ""
echo "   Hi! Try it here: https://[NGROK-URL]"
echo "   Login: admin / admin123"
echo "   Let me know what you think!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start the server
npm run web

