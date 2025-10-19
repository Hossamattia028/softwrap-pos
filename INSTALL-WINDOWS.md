# Softwrap POS - Windows Installation Guide

## Installation

### Method 1: Installer (Recommended)

1. **Download** the file: `Softwrap POS Setup *.exe`

2. **Run the installer:**
   - Double-click the downloaded `.exe` file
   - If you see "Windows protected your PC":
     - Click "More info"
     - Click "Run anyway"

3. **Follow the installation wizard:**
   - Read and accept the license agreement
   - Choose installation location (default is recommended)
   - ✓ Check "Create Desktop Shortcut"
   - ✓ Check "Create Start Menu Shortcut"
   - Click "Install"
   - Wait for installation to complete
   - ✓ Check "Run Softwrap POS" to launch immediately
   - Click "Finish"

4. **Desktop and Start Menu shortcuts are created automatically!**

### Method 2: Portable Version (No Installation)

1. **Download** the file: `Softwrap POS *.exe` (portable)

2. **Create a folder:**
   - Create a folder like `C:\SoftwrapPOS`
   - Move the downloaded `.exe` file into this folder

3. **Run the application:**
   - Double-click `Softwrap POS.exe`
   - No installation needed!

4. **Create Desktop Shortcut (Optional):**
   - Right-click `Softwrap POS.exe`
   - Select "Create shortcut"
   - Drag the shortcut to your Desktop

## First Time Setup

1. Launch the application
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. **⚠️ Important:** Change your password immediately in Settings

## Auto Backup

Your data is automatically backed up every hour to:
```
C:\Users\YourUsername\AppData\Roaming\softwrap-pos\backups\
```

## Uninstallation

### If Installed via Installer:
1. Go to **Settings** → **Apps** → **Apps & features**
2. Find "Softwrap POS"
3. Click "Uninstall"
4. Follow the uninstall wizard

### If Using Portable Version:
Simply delete the folder containing the application.

## Updating

To update to a new version:
1. Uninstall the old version (your data is preserved)
2. Install the new version
3. Your data and settings will be automatically migrated

## Data Location

Your data is stored at:
```
C:\Users\YourUsername\AppData\Roaming\softwrap-pos\
```

To backup your data manually:
1. Close the application
2. Copy the entire `softwrap-pos` folder
3. Save it to a safe location

## Troubleshooting

### "Windows protected your PC" warning
This is normal for unsigned applications:
1. Click "More info"
2. Click "Run anyway"

### Can't find the application after installation
- Check your Desktop for the shortcut
- Check Start Menu → All Apps → Softwrap POS
- Search for "Softwrap" in Windows search

### Database errors
To reset the database:
1. Close the application
2. Navigate to: `%APPDATA%\softwrap-pos\`
3. Delete `database.db`
4. Restart the application (a fresh database will be created)

### Printer not working
1. Ensure your thermal printer is connected
2. Install printer drivers from manufacturer
3. Check printer settings in the application

## System Requirements

- **OS:** Windows 10 or higher (64-bit)
- **RAM:** 4 GB minimum
- **Disk Space:** 500 MB free space
- **Display:** 1366x768 minimum resolution

## Support

For help or questions:
- Email: support@softwrap.com
- Website: [Your website URL]

---

**Softwrap POS** - Professional Offline Point of Sale System

