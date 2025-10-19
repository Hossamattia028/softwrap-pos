#!/bin/bash

# Create Desktop Launcher for Softwrap POS (Development Mode)
# This creates a launcher icon in your Ubuntu application menu

echo "========================================="
echo "Creating Desktop Launcher for Softwrap POS"
echo "========================================="

# Get the absolute path of the project
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ICON_PATH="$PROJECT_DIR/assets/icons/icon.png"

# Create .desktop file content
DESKTOP_FILE_CONTENT="[Desktop Entry]
Version=1.0
Type=Application
Name=Softwrap POS
Comment=Offline Point of Sale System
Exec=bash -c 'cd $PROJECT_DIR && npm start'
Icon=$ICON_PATH
Terminal=false
Categories=Office;Finance;
Keywords=pos;point-of-sale;retail;sales;
StartupNotify=true
StartupWMClass=softwrap-pos"

# Create applications directory if it doesn't exist
mkdir -p ~/.local/share/applications

# Write the desktop file
DESKTOP_FILE_PATH="$HOME/.local/share/applications/softwrap-pos.desktop"
echo "$DESKTOP_FILE_CONTENT" > "$DESKTOP_FILE_PATH"

# Make it executable
chmod +x "$DESKTOP_FILE_PATH"

echo ""
echo "✅ Desktop file created at:"
echo "   $DESKTOP_FILE_PATH"
echo ""

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database ~/.local/share/applications 2>/dev/null
    echo "✅ Desktop database updated"
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache ~/.local/share/icons/hicolor/ -f 2>/dev/null
    echo "✅ Icon cache updated"
fi

# Create desktop shortcut (optional)
echo ""
read -p "Create desktop shortcut? [Y/n]: " create_desktop
if [[ "$create_desktop" != "n" && "$create_desktop" != "N" ]]; then
    DESKTOP_SHORTCUT="$HOME/Desktop/softwrap-pos.desktop"
    echo "$DESKTOP_FILE_CONTENT" > "$DESKTOP_SHORTCUT"
    chmod +x "$DESKTOP_SHORTCUT"
    
    # Mark as trusted
    if command -v gio &> /dev/null; then
        gio set "$DESKTOP_SHORTCUT" metadata::trusted true 2>/dev/null
    fi
    
    echo "✅ Desktop shortcut created"
fi

echo ""
echo "========================================="
echo "✅ Launcher Created Successfully!"
echo "========================================="
echo ""
echo "You can now find 'Softwrap POS' in:"
echo "  • Application Menu → Office"
echo "  • Search for 'Softwrap' or 'POS'"
echo "  • Desktop shortcut (if created)"
echo ""
echo "To launch from terminal:"
echo "  cd $PROJECT_DIR"
echo "  npm start"
echo ""
echo "========================================="

