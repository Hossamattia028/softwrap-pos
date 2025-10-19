#!/bin/bash

# Icon Creation Script for Softwrap POS
# This script generates all required icon sizes from a source PNG file

echo "========================================="
echo "Softwrap POS - Icon Generator"
echo "========================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it using: sudo apt install imagemagick"
    exit 1
fi

# Source icon (should be at least 512x512 PNG)
SOURCE_ICON="assets/icons/icon-512.png"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    echo "Please provide a 512x512 PNG image at this location."
    exit 1
fi

echo "Creating icon files..."

# Create icons directory if it doesn't exist
mkdir -p assets/icons

# Linux icon sizes
echo "Generating Linux icons..."
convert "$SOURCE_ICON" -resize 16x16 assets/icons/icon-16x16.png
convert "$SOURCE_ICON" -resize 32x32 assets/icons/icon-32x32.png
convert "$SOURCE_ICON" -resize 48x48 assets/icons/icon-48x48.png
convert "$SOURCE_ICON" -resize 64x64 assets/icons/icon-64x64.png
convert "$SOURCE_ICON" -resize 128x128 assets/icons/icon-128x128.png
convert "$SOURCE_ICON" -resize 256x256 assets/icons/icon-256x256.png
convert "$SOURCE_ICON" -resize 512x512 assets/icons/icon-512x512.png

# Windows ICO file (multi-resolution)
echo "Generating Windows ICO file..."
convert "$SOURCE_ICON" -define icon:auto-resize=256,128,96,64,48,32,16 assets/icons/icon.ico

# macOS ICNS file (optional)
echo "Generating macOS ICNS file..."
mkdir -p icon.iconset
convert "$SOURCE_ICON" -resize 16x16 icon.iconset/icon_16x16.png
convert "$SOURCE_ICON" -resize 32x32 icon.iconset/icon_16x16@2x.png
convert "$SOURCE_ICON" -resize 32x32 icon.iconset/icon_32x32.png
convert "$SOURCE_ICON" -resize 64x64 icon.iconset/icon_32x32@2x.png
convert "$SOURCE_ICON" -resize 128x128 icon.iconset/icon_128x128.png
convert "$SOURCE_ICON" -resize 256x256 icon.iconset/icon_128x128@2x.png
convert "$SOURCE_ICON" -resize 256x256 icon.iconset/icon_256x256.png
convert "$SOURCE_ICON" -resize 512x512 icon.iconset/icon_256x256@2x.png
convert "$SOURCE_ICON" -resize 512x512 icon.iconset/icon_512x512.png
convert "$SOURCE_ICON" -resize 1024x1024 icon.iconset/icon_512x512@2x.png

if command -v iconutil &> /dev/null; then
    iconutil -c icns icon.iconset -o assets/icons/icon.icns
    rm -rf icon.iconset
else
    echo "Note: iconutil not found (macOS only). Skipping ICNS generation."
    rm -rf icon.iconset
fi

echo ""
echo "========================================="
echo "Icon generation complete!"
echo "Files created in assets/icons/"
echo "========================================="

