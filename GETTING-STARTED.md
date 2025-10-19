# Getting Started with Softwrap POS

## 🎯 Quick Overview

You now have everything set up to build and distribute Softwrap POS installers for Ubuntu and Windows with automatic launcher icon creation!

## ✅ What's Been Set Up

### 1. **Icons**
- ✅ Basic icon template created (SVG + ICO)
- ✅ Icon generation scripts ready
- 📁 Location: `assets/icons/`

### 2. **Build Configuration**
- ✅ Package.json configured for both platforms
- ✅ Automatic desktop shortcut creation (Windows)
- ✅ Automatic menu entry creation (Ubuntu)
- ✅ Proper icon integration

### 3. **Installation Scripts**
- ✅ `install-linux.sh` - Auto-creates Ubuntu launcher
- ✅ Build scripts for both platforms
- ✅ Icon generation scripts

### 4. **Documentation**
- ✅ `README.md` - Project overview
- ✅ `BUILD.md` - Detailed build instructions
- ✅ `QUICK-BUILD-GUIDE.md` - Fast track guide
- ✅ `INSTALL-LINUX.md` - Linux installation guide
- ✅ `INSTALL-WINDOWS.md` - Windows installation guide
- ✅ `HOW-TO-DISTRIBUTE.md` - Distribution guide
- ✅ `LICENSE` - Software license

---

## 🚀 Next Steps

### Step 1: Customize Your Icons (Recommended)

Replace the placeholder icons with your company logo:

```bash
# 1. Create a 512x512 PNG logo and save it as:
#    assets/icons/icon-512.png

# 2. Generate all icon sizes:
./create-icons.sh    # Linux (requires ImageMagick: sudo apt install imagemagick)
# OR
node create-icons.js  # Basic generation (works on any platform)

# OR use online tool:
# Visit: https://www.electron.build/icons
# Upload your logo, download generated icons
# Replace files in assets/icons/
```

### Step 2: Build Your Installers

**For Ubuntu/Linux:**
```bash
npm run build:linux
```

Creates:
- `dist/Softwrap-POS-*.AppImage` ← **Distribute this!**
- `dist/softwrap-pos_*.deb` ← Alternative for Ubuntu users

**For Windows:**
```bash
npm run build:win
```

Creates:
- `dist/Softwrap POS Setup *.exe` ← **Installer with auto shortcuts**
- `dist/Softwrap POS *.exe` ← Portable version

### Step 3: Test Your Installers

**On Ubuntu:**
```bash
cd dist
chmod +x Softwrap-POS-*.AppImage
./install-linux.sh  # This will set up everything
```

**On Windows:**
- Double-click `Softwrap POS Setup.exe`
- Verify desktop shortcut is created ✓
- Verify Start Menu entry is created ✓
- Launch and test

### Step 4: Distribute

Package for customers:
```
YourDistribution/
├── Ubuntu/
│   ├── Softwrap-POS-*.AppImage
│   ├── install-linux.sh
│   └── INSTALL-LINUX.md
└── Windows/
    ├── Softwrap POS Setup.exe
    └── INSTALL-WINDOWS.md
```

---

## 🎨 What Customers Will Get

### Ubuntu Installation
When customers run `install-linux.sh`:
1. ✅ AppImage becomes executable
2. ✅ Launcher appears in Application Menu (Office category)
3. ✅ Desktop shortcut created (optional)
4. ✅ Icon properly displayed
5. ✅ Searchable by "Softwrap" or "POS"

### Windows Installation
When customers run the installer:
1. ✅ Desktop shortcut created automatically
2. ✅ Start Menu entry created automatically
3. ✅ Proper icon displayed
4. ✅ Can be pinned to taskbar
5. ✅ Appears in Windows Search
6. ✅ Uninstaller in "Add/Remove Programs"

---

## 📋 Important Configuration Details

### Automatic Features

**Desktop Shortcuts:**
- **Ubuntu**: Created by `install-linux.sh` or automatically by .deb package
- **Windows**: Created automatically by NSIS installer

**Application Menu Entry:**
- **Ubuntu**: Category: Office > Finance
- **Windows**: Start Menu > Softwrap POS

**Database Location:**
- **Ubuntu**: `~/.config/softwrap-pos/database.db`
- **Windows**: `%APPDATA%\softwrap-pos\database.db`

**Backup Location:**
- **Ubuntu**: `~/.config/softwrap-pos/backups/`
- **Windows**: `%APPDATA%\softwrap-pos\backups/`

### Default Credentials
```
Username: admin
Password: admin123
⚠️ Users should change this immediately!
```

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview and features |
| `BUILD.md` | Comprehensive build instructions |
| `QUICK-BUILD-GUIDE.md` | Fast track for building |
| `INSTALL-LINUX.md` | Give to Linux customers |
| `INSTALL-WINDOWS.md` | Give to Windows customers |
| `HOW-TO-DISTRIBUTE.md` | How to package and distribute |
| This file | Getting started guide |

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Build for Linux
npm run build:linux

# Build for Windows
npm run build:win

# Build for all platforms
npm run build

# Generate icons
node create-icons.js
./create-icons.sh  # Linux only
```

---

## ✨ Key Features Enabled

### Application Features
- ✅ Fully offline operation
- ✅ SQLite database
- ✅ Automatic backups (every 60 minutes)
- ✅ Multi-user support
- ✅ Role-based access control
- ✅ Thermal printer support
- ✅ PDF receipt generation
- ✅ Multi-language support

### Distribution Features
- ✅ Professional installers
- ✅ Automatic launcher creation
- ✅ Desktop shortcuts
- ✅ Proper uninstallers
- ✅ Portable versions available
- ✅ No dependencies required (everything bundled)

---

## 🎯 Quick Start Checklist

For developers:
- [ ] Run `npm install`
- [ ] Test with `npm run dev`
- [ ] Customize icons (optional)
- [ ] Build installers
- [ ] Test on both platforms
- [ ] Package for distribution

For distributors:
- [ ] Build installers
- [ ] Test installation
- [ ] Verify shortcuts created
- [ ] Include installation guides
- [ ] Provide support contact
- [ ] Document default credentials

---

## 💡 Pro Tips

1. **Cross-Platform Building:**
   - Build Linux packages on Linux
   - Build Windows packages on Windows
   - Use Docker/CI for automated builds

2. **Icon Customization:**
   - Use 512x512 PNG for best quality
   - Maintain transparency for rounded corners
   - Test icons on both light and dark backgrounds

3. **Distribution:**
   - AppImage is universal (recommended for Linux)
   - NSIS installer is best for Windows
   - Always include installation guides

4. **Testing:**
   - Test on clean VMs before distributing
   - Verify shortcuts work correctly
   - Check database creation
   - Test backup functionality

---

## 🆘 Need Help?

1. **Build Issues:** See `BUILD.md`
2. **Icon Problems:** Run `node create-icons.js`
3. **Installation Issues:** Check platform-specific guide
4. **Distribution Questions:** See `HOW-TO-DISTRIBUTE.md`

---

## 🎉 You're Ready!

Everything is now configured for building professional installers with automatic launcher icon creation for both Ubuntu and Windows!

**Next action:** Run `npm run build` to create your installers!

---

**Questions?** Check the documentation files or contact support.

**Happy distributing! 🚀**

