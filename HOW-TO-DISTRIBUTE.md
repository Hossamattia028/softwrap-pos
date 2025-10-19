# How to Distribute Softwrap POS

## Overview

This guide explains how to create and distribute installation packages for your customers on Ubuntu and Windows.

## Quick Summary

1. **Build** the installers: `npm run build`
2. **Test** on both platforms
3. **Package** with installation guides
4. **Distribute** via download link or physical media

---

## Step-by-Step Distribution Process

### 1. Prepare for Build

```bash
# Ensure dependencies are installed
npm install

# Update version number in package.json
# Change: "version": "1.0.0" to your desired version

# Optional: Customize icons
# Place your logo at assets/icons/icon-512.png
# Run: node create-icons.js
```

### 2. Build Installers

**On Ubuntu/Linux machine:**
```bash
npm run build:linux
```

This creates:
- `dist/Softwrap-POS-1.0.0.AppImage` - Universal Linux package
- `dist/softwrap-pos_1.0.0_amd64.deb` - Ubuntu/Debian package

**On Windows machine:**
```bash
npm run build:win
```

This creates:
- `dist/Softwrap POS Setup 1.0.0.exe` - Windows installer
- `dist/Softwrap POS 1.0.0.exe` - Portable Windows app

### 3. Test Installers

**Test Linux packages:**
```bash
# Test AppImage
cd dist
chmod +x Softwrap-POS-*.AppImage
./Softwrap-POS-*.AppImage

# Test DEB
sudo dpkg -i softwrap-pos_*.deb
```

**Test Windows packages:**
- Run the installer on a clean Windows machine
- Verify shortcuts are created
- Test the portable version
- Check application launches correctly

### 4. Create Distribution Package

Create a folder structure like this:

```
Softwrap-POS-v1.0.0-Distribution/
│
├── README.txt
├── LICENSE.txt
│
├── Linux/
│   ├── Softwrap-POS-1.0.0.AppImage
│   ├── softwrap-pos_1.0.0_amd64.deb (optional)
│   ├── install-linux.sh
│   └── INSTALL-LINUX.md
│
└── Windows/
    ├── Softwrap POS Setup 1.0.0.exe
    ├── Softwrap POS 1.0.0.exe (portable, optional)
    └── INSTALL-WINDOWS.md
```

**Create README.txt:**
```txt
SOFTWRAP POS - Installation Package

Please select your operating system:

FOR UBUNTU/LINUX USERS:
  1. Open the "Linux" folder
  2. Read INSTALL-LINUX.md for instructions
  3. Run Softwrap-POS-*.AppImage

FOR WINDOWS USERS:
  1. Open the "Windows" folder
  2. Read INSTALL-WINDOWS.md for instructions
  3. Run "Softwrap POS Setup.exe"

Default Login:
  Username: admin
  Password: admin123
  
IMPORTANT: Change the password after first login!

For support, contact: support@softwrap.com
```

### 5. Distribution Methods

#### Option A: Cloud Distribution (Recommended)

**Setup download links:**
```
https://yourwebsite.com/downloads/softwrap-pos-linux-1.0.0.AppImage
https://yourwebsite.com/downloads/softwrap-pos-windows-1.0.0.exe
```

**Create download page:**
- Linux download button → AppImage
- Windows download button → Installer
- Include installation guides
- List system requirements
- Provide support contact

#### Option B: Physical Media (USB/DVD)

1. Copy distribution folder to USB drive/DVD
2. Include autorun.inf for Windows (optional):
   ```ini
   [autorun]
   open=Windows\Softwrap POS Setup.exe
   icon=Windows\icon.ico
   label=Softwrap POS Installer
   ```

3. Add printed quick start guide

#### Option C: Internal Network

For corporate environments:
```bash
# Host on internal network
# Share via SMB/NFS
\\server\software\softwrap-pos\

# Or internal web server
http://intranet/software/softwrap-pos/
```

---

## Installation Process for End Users

### Linux Installation (Ubuntu)

**Method 1: AppImage (Easiest)**
```bash
# Download AppImage
wget https://yourwebsite.com/downloads/softwrap-pos.AppImage

# Make executable
chmod +x softwrap-pos.AppImage

# Run the installation script
bash install-linux.sh
```

The script will:
- ✅ Make AppImage executable
- ✅ Move to ~/Applications
- ✅ Create desktop entry
- ✅ Create Start Menu entry
- ✅ Create desktop shortcut
- ✅ Set up icon

**Method 2: DEB Package**
```bash
# Download and install
sudo dpkg -i softwrap-pos_1.0.0_amd64.deb
sudo apt-get install -f
```

Launcher is automatically created!

### Windows Installation

**Standard Installation:**
1. Double-click `Softwrap POS Setup.exe`
2. Follow wizard:
   - Accept license
   - Choose location
   - Select shortcuts (Desktop + Start Menu)
   - Install
3. Done! Shortcuts created automatically

**Portable Version:**
1. Copy `Softwrap POS.exe` to desired folder
2. Double-click to run
3. No installation needed

---

## What Customers Get

### Automatic Features

**Ubuntu/Linux:**
- ✅ Application appears in menu (Office category)
- ✅ Desktop shortcut (if requested)
- ✅ Proper icon in launcher
- ✅ Application can be pinned to dock
- ✅ Search finds "Softwrap" or "POS"

**Windows:**
- ✅ Desktop shortcut
- ✅ Start Menu entry
- ✅ Windows Search integration
- ✅ Pinnable to taskbar
- ✅ Proper uninstaller
- ✅ "Add/Remove Programs" entry

### Application Features

On first run, the application:
1. Creates database in user's home directory
2. Sets up default admin account
3. Starts automatic backup system
4. Shows login screen

---

## Support & Updates

### Providing Support

**Common customer questions:**

1. **"Where is the launcher?"**
   - Ubuntu: Check application menu → Office
   - Windows: Desktop or Start Menu

2. **"How do I update?"**
   - Download new version
   - Install over old version
   - Data is preserved automatically

3. **"Where is my data?"**
   - Ubuntu: `~/.config/softwrap-pos/`
   - Windows: `%APPDATA%\softwrap-pos\`

### Updates

**To release an update:**

1. Update version in `package.json`
2. Rebuild installers
3. Test thoroughly
4. Update download links
5. Notify customers

**Customers update by:**
- Downloading new installer
- Installing over old version
- Database migrates automatically

---

## Troubleshooting Installation

### Ubuntu Issues

**"Permission denied"**
```bash
chmod +x Softwrap-POS-*.AppImage
```

**"Icon not showing"**
```bash
gtk-update-icon-cache ~/.local/share/icons/hicolor/
```

**"AppImage won't run"**
```bash
sudo apt-get install fuse libfuse2
```

### Windows Issues

**"Windows protected your PC"**
- This appears because app is unsigned
- Click "More info" → "Run anyway"
- For production, get code signing certificate

**"Can't find after install"**
- Check Desktop for shortcut
- Check Start Menu → All Apps
- Search for "Softwrap"

---

## Best Practices

### Before Distribution

- [ ] Test on clean systems (both OS)
- [ ] Verify all shortcuts work
- [ ] Test database creation
- [ ] Test backup functionality
- [ ] Check default login works
- [ ] Verify icons display correctly
- [ ] Test uninstallation
- [ ] Review installation guides

### Documentation to Include

1. **Must have:**
   - Installation guide
   - Default credentials
   - Support contact

2. **Should have:**
   - Quick start guide
   - Feature overview
   - Troubleshooting tips

3. **Nice to have:**
   - Video tutorial
   - FAQ document
   - Training materials

### Marketing Materials

Create simple materials:
- One-page feature list
- Screenshots
- System requirements
- Pricing information

---

## System Requirements

**Tell customers they need:**

**Ubuntu/Linux:**
- Ubuntu 18.04+ or equivalent
- 4 GB RAM minimum
- 500 MB free disk space
- USB port (for thermal printer)

**Windows:**
- Windows 10 or Windows 11 (64-bit)
- 4 GB RAM minimum
- 500 MB free disk space
- USB port (for thermal printer)

---

## Licensing

**Make sure customers know:**
- This is proprietary software
- Licensed per installation or per business
- See LICENSE file for terms
- Contact for multi-license pricing

---

## Conclusion

Your distribution package should include:
1. Installers for both platforms
2. Clear installation instructions
3. Default credentials
4. Support contact information

The application will automatically:
- Create database on first run
- Set up backup system
- Create launcher icons
- Provide login screen

For questions about distribution, contact: support@softwrap.com

