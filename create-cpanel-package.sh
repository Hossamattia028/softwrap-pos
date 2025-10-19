#!/bin/bash

# Script to create a deployment package for cPanel

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     📦 Creating cPanel Deployment Package...              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Package name
PACKAGE_NAME="softwrap-pos-cpanel-$(date +%Y%m%d-%H%M%S).zip"

# Check if zip is installed
if ! command -v zip &> /dev/null; then
    echo "❌ Error: 'zip' command not found. Installing..."
    sudo apt-get install -y zip
fi

echo "📁 Including files:"
echo "  • src/"
echo "  • assets/"
echo "  • package.json"
echo "  • .htaccess"
echo ""

# Create the package
zip -r "$PACKAGE_NAME" \
  src/ \
  assets/ \
  package.json \
  .htaccess \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/.git/*" \
  -x "*.md" \
  -x "*.sh" \
  -x "*.bat" \
  -x ".gitignore" \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    echo "✅ Package created successfully!"
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "📦 Package: $PACKAGE_NAME"
    echo "📊 Size: $SIZE"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 Next Steps:"
    echo ""
    echo "1. Login to your cPanel"
    echo "2. Open File Manager"
    echo "3. Navigate to public_html (or subdomain folder)"
    echo "4. Create folder: softwrap-pos"
    echo "5. Upload: $PACKAGE_NAME"
    echo "6. Extract the ZIP file"
    echo "7. Setup Node.js App in cPanel"
    echo ""
    echo "📖 Full guide: CPANEL-DEPLOYMENT-GUIDE.md"
    echo ""
else
    echo "❌ Error creating package"
    exit 1
fi

