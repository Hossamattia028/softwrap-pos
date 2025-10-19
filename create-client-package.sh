#!/bin/bash

# Script to create a ready-to-use package for Windows clients
# The client just needs to extract and double-click the .exe file

echo "Creating client package..."

# Check if Windows portable exe exists
if [ ! -f "dist/Softwrap POS"*.exe ] && [ ! -f "dist/"*"portable"*.exe ]; then
    echo "❌ Error: Windows portable .exe not found in dist/ folder"
    echo ""
    echo "You need to build the Windows version first:"
    echo "  1. Push your code to GitHub"
    echo "  2. Go to Actions tab"
    echo "  3. Download the built .exe"
    echo "  4. Place it in dist/ folder"
    echo "  5. Run this script again"
    exit 1
fi

# Create package directory
PACKAGE_DIR="Softwrap-POS-For-Client"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Copy the portable exe
cp dist/*.exe "$PACKAGE_DIR/" 2>/dev/null || true

# Create a simple README for the client
cat > "$PACKAGE_DIR/START-HERE.txt" << 'EOF'
SOFTWRAP POS - Point of Sale System

HOW TO USE:
===========
1. Double-click "Softwrap POS.exe" to start the application
2. Login with:
   Username: admin
   Password: admin123

3. ⚠️ IMPORTANT: Change your password in Settings after first login!

THAT'S IT! No installation needed.

NOTES:
------
- Your data is automatically saved
- Automatic backups are created every hour
- All data is stored in: C:\Users\YourName\AppData\Roaming\softwrap-pos\

If you see "Windows protected your PC" warning:
- Click "More info"
- Click "Run anyway"
- This is normal for new applications

For support, contact: support@softwrap.com
EOF

# Create a zip file
ZIP_NAME="Softwrap-POS-Portable-v1.0.0.zip"
if command -v zip &> /dev/null; then
    rm -f "$ZIP_NAME"
    zip -r "$ZIP_NAME" "$PACKAGE_DIR"
    echo ""
    echo "✅ Package created successfully!"
    echo ""
    echo "📦 Send this to your client:"
    echo "   → $ZIP_NAME"
    echo ""
    echo "Client instructions:"
    echo "   1. Extract the ZIP file"
    echo "   2. Double-click 'Softwrap POS.exe'"
    echo "   3. That's it!"
else
    echo ""
    echo "✅ Package folder created: $PACKAGE_DIR"
    echo ""
    echo "📦 Send this folder to your client"
    echo "   Client just needs to double-click 'Softwrap POS.exe'"
fi

echo ""
echo "Done! 🎉"

