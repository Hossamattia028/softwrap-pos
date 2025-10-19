#!/bin/bash

# Softwrap POS - Quick Run Script
# This script helps you quickly run the application in development mode

echo "=================================="
echo "   Softwrap POS - Quick Start"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "This may take a few minutes on first run..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting Softwrap POS in development mode..."
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop the application"
echo "=================================="
echo ""

# Run the application
npm run dev

# Note: If you encounter sandbox errors, the --no-sandbox flag is already included
# Alternatively, you can fix sandbox permissions with:
# sudo chown root:root node_modules/electron/dist/chrome-sandbox
# sudo chmod 4755 node_modules/electron/dist/chrome-sandbox

