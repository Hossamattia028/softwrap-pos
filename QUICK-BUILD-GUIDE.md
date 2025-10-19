# Quick Build Guide

## 🚀 Fast Track to Building Your Installers

### Step 1: Prepare (One-time setup)

```bash
# Install dependencies
npm install

# Generate icons (basic placeholders are already created)
# For custom icons, replace assets/icons/icon-512.png with your logo
# Then run: ./create-icons.sh (Linux) or node create-icons.js
```

### Step 2: Build

**For Ubuntu/Linux:**
```bash
npm run build:linux
```
Output files in `dist/`:
- `Softwrap-POS-*.AppImage` ← **Distribute this!**
- `softwrap-pos_*.deb` ← Alternative for Ubuntu/Debian users

**For Windows:**
```bash
npm run build:win
```
Output files in `dist/`:
- `Softwrap POS Setup *.exe` ← **Installer with auto shortcuts**
- `Softwrap POS *.exe` ← Portable version

### Step 3: Test

**Test on Ubuntu:**
```bash
cd dist
chmod +x Softwrap-POS-*.AppImage
./Softwrap-POS-*.AppImage
```

**Test on Windows:**
- Double-click `Softwrap POS Setup.exe`
- Follow installer
- Check desktop shortcut works

### Step 4: Distribute

**Package for distribution:**
```
MyDistribution/
├── Ubuntu/
│   ├── Softwrap-POS-*.AppImage
│   ├── install-linux.sh
│   └── INSTALL-LINUX.md
└── Windows/
    ├── Softwrap POS Setup.exe
    └── INSTALL-WINDOWS.md
```

---

## 🎨 Customizing Icons

### Quick Method (Online Tools)
1. Create/upload your logo to: https://www.electron.build/icons
2. Download generated icons
3. Place in `assets/icons/`
4. Rebuild

### Manual Method
```bash
# 1. Place your 512x512 PNG logo
cp /path/to/your/logo.png assets/icons/icon-512.png

# 2. Generate all sizes (Linux only, requires ImageMagick)
./create-icons.sh

# 3. OR use basic generator (cross-platform)
node create-icons.js

# 4. Rebuild
npm run build
```

---

## 📦 What Gets Built

### Linux Packages

**AppImage** (Recommended)
- ✅ Works on ALL Linux distributions
- ✅ No installation required
- ✅ Portable
- ✅ Auto-updates support
- Use: General distribution

**DEB Package**
- ✅ Integrates with system
- ✅ Auto-creates launcher
- ✅ Managed by apt
- 🔸 Ubuntu/Debian only
- Use: Corporate/managed environments

### Windows Packages

**NSIS Installer** (Recommended)
- ✅ Professional installer
- ✅ Auto-creates desktop shortcut
- ✅ Auto-creates Start Menu shortcut
- ✅ Uninstaller included
- ✅ Customizable install location
- Use: General distribution

**Portable EXE**
- ✅ No installation needed
- ✅ Run from USB
- ✅ No admin rights required
- 🔸 No auto-updates
- Use: Temporary/restricted systems

---

## 🔧 Common Build Issues

### "Module not found" errors
```bash
rm -rf node_modules
npm install
npm run build
```

### "Icon not found" warnings
```bash
node create-icons.js
npm run build
```

### Build fails on Linux
```bash
# Install required packages
sudo apt-get install -y build-essential
npm run build:linux
```

### Build fails on Windows
- Ensure you have Windows 10 SDK installed
- Run as Administrator if needed

### File too large
- Check `node_modules` isn't included
- Verify `.gitignore` is working
- Remove unnecessary files from `src/`

---

## 📋 Pre-Distribution Checklist

- [ ] Icons customized with company logo
- [ ] License file updated
- [ ] Default password documented
- [ ] README updated with company info
- [ ] Support email updated
- [ ] Version number updated in `package.json`
- [ ] Tested on target OS
- [ ] Installation guides included
- [ ] Backup functionality tested
- [ ] Printer functionality tested (if applicable)

---

## 🚢 Shipping Files

### Minimum Distribution

**For Linux users:**
- `Softwrap-POS-*.AppImage`
- `INSTALL-LINUX.md`

**For Windows users:**
- `Softwrap POS Setup *.exe`
- `INSTALL-WINDOWS.md`

### Complete Distribution

```
Softwrap-POS-v1.0.0/
├── README.md
├── LICENSE
├── Linux/
│   ├── Softwrap-POS-1.0.0.AppImage
│   ├── softwrap-pos_1.0.0_amd64.deb
│   ├── install-linux.sh
│   └── INSTALL-LINUX.md
└── Windows/
    ├── Softwrap POS Setup 1.0.0.exe
    ├── Softwrap POS 1.0.0.exe (portable)
    └── INSTALL-WINDOWS.md
```

---

## 🔄 Version Updates

Update version in `package.json`:
```json
{
  "version": "1.0.1"
}
```

Then rebuild:
```bash
npm run build
```

---

## 💡 Tips

1. **Cross-platform building:**
   - Build Windows installers on Windows
   - Build Linux packages on Linux
   - Or use Docker/CI for cross-platform builds

2. **File size optimization:**
   - Installers are large (~150-300MB) due to Electron
   - This is normal and expected
   - Consider offering cloud download vs physical media

3. **Code signing:**
   - For production, sign your executables
   - Windows: Get code signing certificate
   - Linux: Sign AppImages
   - This removes security warnings

4. **Auto-updates:**
   - Configure update server in package.json
   - Use electron-updater
   - See: https://www.electron.build/auto-update

---

Need more details? See [BUILD.md](BUILD.md)

