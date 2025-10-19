#!/bin/bash

# Softwrap POS - Linux Installation Script
# This script creates a desktop launcher for the AppImage

echo "========================================="
echo "Softwrap POS - Linux Installer"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find AppImage in current directory
APPIMAGE=$(find . -maxdepth 1 -name "Softwrap-POS*.AppImage" | head -n 1)

if [ -z "$APPIMAGE" ]; then
    echo -e "${RED}Error: Softwrap-POS AppImage not found in current directory${NC}"
    echo "Please run this script from the directory containing the AppImage file."
    exit 1
fi

echo -e "${GREEN}✓${NC} Found: $APPIMAGE"
echo ""

# Make AppImage executable
chmod +x "$APPIMAGE"
echo -e "${GREEN}✓${NC} Made AppImage executable"

# Create Applications directory if it doesn't exist
INSTALL_DIR="$HOME/Applications"
mkdir -p "$INSTALL_DIR"

# Get absolute path of AppImage
APPIMAGE_PATH=$(realpath "$APPIMAGE")

# Ask user if they want to copy or move the AppImage
echo ""
echo "Where would you like to install Softwrap POS?"
echo "1) Copy to $INSTALL_DIR (keep original)"
echo "2) Move to $INSTALL_DIR (remove from current location)"
echo "3) Keep in current location: $(dirname "$APPIMAGE_PATH")"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        cp "$APPIMAGE_PATH" "$INSTALL_DIR/"
        FINAL_PATH="$INSTALL_DIR/$(basename "$APPIMAGE")"
        echo -e "${GREEN}✓${NC} Copied AppImage to $INSTALL_DIR"
        ;;
    2)
        mv "$APPIMAGE_PATH" "$INSTALL_DIR/"
        FINAL_PATH="$INSTALL_DIR/$(basename "$APPIMAGE")"
        echo -e "${GREEN}✓${NC} Moved AppImage to $INSTALL_DIR"
        ;;
    3)
        FINAL_PATH="$APPIMAGE_PATH"
        echo -e "${GREEN}✓${NC} Using current location"
        ;;
    *)
        echo -e "${RED}Invalid choice. Using current location.${NC}"
        FINAL_PATH="$APPIMAGE_PATH"
        ;;
esac

# Create .local/share/applications directory
mkdir -p "$HOME/.local/share/applications"

# Create desktop entry
DESKTOP_FILE="$HOME/.local/share/applications/softwrap-pos.desktop"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Softwrap POS
Comment=Offline Point of Sale System
Icon=softwrap-pos
Exec="$FINAL_PATH" %U
Terminal=false
Categories=Office;Finance;
Keywords=pos;point-of-sale;retail;sales;
StartupNotify=true
EOF

chmod +x "$DESKTOP_FILE"
echo -e "${GREEN}✓${NC} Created application menu entry"

# Try to extract and install icon from AppImage
if command -v 7z &> /dev/null || command -v unzip &> /dev/null; then
    echo -e "${YELLOW}→${NC} Attempting to extract icon from AppImage..."
    
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR" || exit
    
    if "$FINAL_PATH" --appimage-extract "*.png" 2>/dev/null || "$FINAL_PATH" --appimage-extract "*.svg" 2>/dev/null; then
        # Find icon file
        ICON_FILE=$(find squashfs-root -name "*icon*" -o -name "*logo*" | grep -i "png\|svg" | head -n 1)
        
        if [ -n "$ICON_FILE" ]; then
            ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
            mkdir -p "$ICON_DIR"
            cp "$ICON_FILE" "$ICON_DIR/softwrap-pos.png"
            echo -e "${GREEN}✓${NC} Installed application icon"
        fi
    fi
    
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
fi

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null
    echo -e "${GREEN}✓${NC} Updated application database"
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache "$HOME/.local/share/icons/hicolor/" -f 2>/dev/null
    echo -e "${GREEN}✓${NC} Updated icon cache"
fi

# Create desktop shortcut (optional)
echo ""
read -p "Create desktop shortcut? [Y/n]: " create_desktop
if [[ "$create_desktop" != "n" && "$create_desktop" != "N" ]]; then
    DESKTOP_SHORTCUT="$HOME/Desktop/softwrap-pos.desktop"
    cp "$DESKTOP_FILE" "$DESKTOP_SHORTCUT"
    chmod +x "$DESKTOP_SHORTCUT"
    
    # Mark as trusted on some systems
    if command -v gio &> /dev/null; then
        gio set "$DESKTOP_SHORTCUT" metadata::trusted true 2>/dev/null
    fi
    
    echo -e "${GREEN}✓${NC} Created desktop shortcut"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "========================================="
echo ""
echo "You can now:"
echo "  • Find 'Softwrap POS' in your application menu"
echo "  • Run from desktop shortcut (if created)"
echo "  • Run from terminal: $FINAL_PATH"
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Please change the password after first login!${NC}"
echo ""
echo "For help, see INSTALL-LINUX.md"
echo "========================================="

