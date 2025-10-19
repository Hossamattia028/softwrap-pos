# Softwrap POS - Build & Installation Guide

This guide explains how to build installers and create launcher icons for Ubuntu and Windows.

## Prerequisites

### For Development
- Node.js 16.x or higher
- npm or yarn
- Git

### For Building
- **Ubuntu/Linux**: Standard build tools (`build-essential`)
- **Windows**: Windows 10/11 (for building Windows installers)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Icons (Optional)

If you want to customize the application icon:

```bash
# Place your 512x512 PNG logo at assets/icons/icon-512.png
# Then run:
./create-icons.sh    # On Linux (requires ImageMagick)
# or
node create-icons.js  # Basic placeholder (works anywhere)
```

**For professional icons**, use online tools:
- https://www.electron.build/icons
- https://convertico.com/
- https://icoconvert.com/

### 3. Build Installers

#### Build for Ubuntu/Linux

```bash
npm run build:linux
```

This creates:
- `dist/Softwrap-POS-*.AppImage` - Universal Linux package (recommended)
- `dist/softwrap-pos_*.deb` - Debian/Ubuntu package

#### Build for Windows

```bash
npm run build:win
```

This creates:
- `dist/Softwrap POS Setup *.exe` - Windows installer with desktop shortcuts
- `dist/Softwrap POS *.exe` - Portable version (no installation required)

#### Build for All Platforms

```bash
npm run build
```

---

## Installation Instructions

### Ubuntu/Linux Installation

#### Option 1: AppImage (Recommended)
1. Download `Softwrap-POS-*.AppImage`
2. Make it executable:
   ```bash
   chmod +x Softwrap-POS-*.AppImage
   ```
3. Run it:
   ```bash
   ./Softwrap-POS-*.AppImage
   ```

**Create Desktop Launcher (AppImage):**
```bash
# Create desktop entry
cat > ~/.local/share/applications/softwrap-pos.desktop << 'EOF'
[Desktop Entry]
Name=Softwrap POS
Comment=Offline Point of Sale System
Exec=/path/to/Softwrap-POS-*.AppImage
Icon=softwrap-pos
Terminal=false
Type=Application
Categories=Office;Finance;
EOF

# Copy icon (if you have one)
cp /path/to/icon.png ~/.local/share/icons/hicolor/512x512/apps/softwrap-pos.png

# Update desktop database
update-desktop-database ~/.local/share/applications
```

#### Option 2: DEB Package
1. Download `softwrap-pos_*.deb`
2. Install it:
   ```bash
   sudo dpkg -i softwrap-pos_*.deb
   sudo apt-get install -f  # Fix dependencies if needed
   ```
3. The launcher will automatically appear in your application menu

**Desktop Launcher is created automatically!**

To uninstall:
```bash
sudo apt-get remove softwrap-pos
```

### Windows Installation

#### Option 1: Installer (Recommended)
1. Download `Softwrap POS Setup *.exe`
2. Double-click to run the installer
3. Follow the installation wizard:
   - Choose installation directory
   - Select "Create Desktop Shortcut" ✓
   - Select "Create Start Menu Shortcut" ✓
   - Click "Install"
4. **Desktop and Start Menu shortcuts are created automatically!**

#### Option 2: Portable Version
1. Download `Softwrap POS *.exe` (portable)
2. Place it in a folder of your choice
3. Double-click to run (no installation needed)

**Create Desktop Shortcut Manually:**
1. Right-click `Softwrap POS.exe`
2. Select "Create shortcut"
3. Move the shortcut to your Desktop

---

## Post-Installation Setup

### First Run

1. The application will automatically create a database
2. Default admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. **⚠️ Change the default password immediately!**

### Auto Backup Configuration

The application automatically backs up your data every 60 minutes to:
- **Ubuntu**: `~/.config/softwrap-pos/backups/`
- **Windows**: `%APPDATA%/softwrap-pos/backups/`

---

## Development

### Run in Development Mode

```bash
npm run dev
```

### Run in Production Mode

```bash
npm start
```

---

## Troubleshooting

### Linux: "Permission denied" when running AppImage
```bash
chmod +x Softwrap-POS-*.AppImage
```

### Linux: AppImage doesn't run
Install FUSE:
```bash
sudo apt-get install fuse libfuse2
```

### Windows: "Windows protected your PC" warning
1. Click "More info"
2. Click "Run anyway"
(This appears because the app is not code-signed)

### Database Issues
Delete the database to start fresh:
- **Ubuntu**: `rm ~/.config/softwrap-pos/database.db`
- **Windows**: Delete `%APPDATA%\softwrap-pos\database.db`

### Launcher Icon Not Showing (Linux)
Update icon cache:
```bash
gtk-update-icon-cache ~/.local/share/icons/hicolor/
```

---

## Customization

### Change Application Icon

1. Create your icons (512x512 PNG recommended)
2. Place in `assets/icons/icon-512.png`
3. Generate all sizes:
   ```bash
   ./create-icons.sh  # Linux with ImageMagick
   ```
4. Rebuild the application:
   ```bash
   npm run build
   ```

### Change Application Name

Edit `package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "build": {
    "appId": "com.yourcompany.yourapp"
  }
}
```

---

## Distribution

### Recommended Files to Distribute

**For Ubuntu/Linux Users:**
- `Softwrap-POS-*.AppImage` (easier, universal)
- `softwrap-pos_*.deb` (for Ubuntu/Debian users)
- `INSTALL-LINUX.md` (installation instructions)

**For Windows Users:**
- `Softwrap POS Setup *.exe` (installer with auto shortcuts)
- `INSTALL-WINDOWS.md` (installation instructions)

---

## Support

For issues or questions:
- Email: support@softwrap.com
- Documentation: [Your documentation URL]

---

## License

Proprietary - See LICENSE file for details

