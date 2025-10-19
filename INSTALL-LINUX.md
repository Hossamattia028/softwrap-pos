# Softwrap POS - Linux Installation Guide

## Installation

### Method 1: AppImage (Recommended - Works on All Linux Distributions)

1. **Download** the file: `Softwrap-POS-*.AppImage`

2. **Make it executable:**
   ```bash
   chmod +x Softwrap-POS-*.AppImage
   ```

3. **Run the application:**
   ```bash
   ./Softwrap-POS-*.AppImage
   ```

4. **Create Desktop Launcher (Optional):**
   - Right-click the AppImage
   - Select "AppImageLauncher" if available, OR
   - Run this script:
   ```bash
   # Save AppImage to permanent location first
   mkdir -p ~/Applications
   mv Softwrap-POS-*.AppImage ~/Applications/
   
   # Create desktop entry
   cat > ~/.local/share/applications/softwrap-pos.desktop << EOF
   [Desktop Entry]
   Name=Softwrap POS
   Comment=Offline Point of Sale System
   Exec=$HOME/Applications/Softwrap-POS-*.AppImage
   Icon=softwrap-pos
   Terminal=false
   Type=Application
   Categories=Office;Finance;
   EOF
   
   # Update desktop database
   update-desktop-database ~/.local/share/applications
   ```

### Method 2: DEB Package (Ubuntu/Debian Only)

1. **Download** the file: `softwrap-pos_*.deb`

2. **Install via GUI:**
   - Double-click the `.deb` file
   - Click "Install"
   - Enter your password when prompted

3. **OR Install via Terminal:**
   ```bash
   sudo dpkg -i softwrap-pos_*.deb
   sudo apt-get install -f  # Fix any missing dependencies
   ```

4. **Launch:**
   - Find "Softwrap POS" in your application menu
   - Desktop launcher is automatically created!

## First Time Setup

1. Launch the application
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. **⚠️ Important:** Change your password immediately in Settings

## Uninstallation

### AppImage
Simply delete the AppImage file and desktop entry:
```bash
rm ~/Applications/Softwrap-POS-*.AppImage
rm ~/.local/share/applications/softwrap-pos.desktop
```

### DEB Package
```bash
sudo apt-get remove softwrap-pos
```

## Troubleshooting

### "Permission denied" error
```bash
chmod +x Softwrap-POS-*.AppImage
```

### AppImage won't run
Install FUSE:
```bash
sudo apt-get install fuse libfuse2
```

### Database location
Your data is stored at: `~/.config/softwrap-pos/`

## Support

For help or questions, contact: support@softwrap.com

