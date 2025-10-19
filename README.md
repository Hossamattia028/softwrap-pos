# Softwrap POS

**Professional Offline Point of Sale System**

A modern, offline desktop application for managing your retail business. Works on Windows and Linux without requiring an internet connection.

![Softwrap POS](assets/icons/icon-template.svg)

## Features

- 🛒 **Complete POS System** - Fast product scanning and checkout
- 📦 **Inventory Management** - Track stock levels and movements
- 📊 **Sales Reports** - Daily, weekly, monthly analytics
- 💰 **Expense Tracking** - Monitor business expenses
- 🧾 **Receipt Printing** - Thermal and PDF receipts
- 🔐 **Multi-User Support** - Role-based access control
- 💾 **Automatic Backups** - Never lose your data
- 🌐 **Multi-Language** - Support for multiple languages
- 🔒 **Fully Offline** - Works without internet connection
- 🖨️ **Invoice Generation** - Professional PDF invoices

## Quick Start

### For End Users

**Download the installer for your operating system:**

- 📥 **Windows**: `Softwrap POS Setup.exe`
  - [Installation Guide for Windows](INSTALL-WINDOWS.md)

- 📥 **Linux**: `Softwrap-POS.AppImage` or `.deb`
  - [Installation Guide for Linux](INSTALL-LINUX.md)

**Default Login:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this immediately after first login!**

## For Developers

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd main_pos

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building Installers

See [BUILD.md](BUILD.md) for detailed build instructions.

```bash
# Build for Linux
npm run build:linux

# Build for Windows
npm run build:win

# Build for all platforms
npm run build
```

## Project Structure

```
main_pos/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Application entry point
│   │   ├── database.js    # SQLite database
│   │   ├── ipc-handlers.js # IPC communication
│   │   ├── backup.js      # Backup management
│   │   ├── printer.js     # Thermal printer support
│   │   └── pdf-generators.js # PDF generation
│   └── renderer/          # Frontend UI
│       ├── index.html     # Main HTML
│       ├── app.js         # Application logic
│       ├── styles.css     # Styling
│       ├── translations.js # i18n translations
│       └── i18n-helper.js # i18n utilities
├── assets/
│   └── icons/             # Application icons
├── dist/                  # Built installers (generated)
├── package.json           # Dependencies & build config
├── BUILD.md              # Build instructions
├── INSTALL-WINDOWS.md    # Windows install guide
└── INSTALL-LINUX.md      # Linux install guide
```

## Technology Stack

- **Electron** - Desktop application framework
- **Better-SQLite3** - Fast SQLite database
- **PDFKit** - PDF generation
- **ESC/POS** - Thermal printer support
- **bcrypt** - Password hashing
- **Vanilla JavaScript** - No heavy frameworks

## Configuration

### Database Location

- **Linux**: `~/.config/softwrap-pos/database.db`
- **Windows**: `%APPDATA%\softwrap-pos\database.db`

### Backup Location

- **Linux**: `~/.config/softwrap-pos/backups/`
- **Windows**: `%APPDATA%\softwrap-pos\backups\`

### Auto Backup

Automatic backups run every 60 minutes while the application is running.

## Customization

### Icons

To customize the application icon:

1. Place your 512x512 PNG logo at `assets/icons/icon-512.png`
2. Run: `./create-icons.sh` (Linux) or `node create-icons.js`
3. Rebuild the application

### Branding

Edit `package.json` to change:
- Application name
- Company name
- App ID

See [BUILD.md](BUILD.md) for details.

## Printing

### Thermal Printers
Supports ESC/POS compatible thermal printers via USB.

### PDF Receipts
Generates PDF receipts and invoices saved to Downloads folder.

## Security

- Passwords are hashed using bcrypt
- Database is stored locally (not cloud)
- Role-based access control (Admin, Cashier, Manager)
- Automatic session management

## Backup & Restore

- **Automatic Backups**: Every 60 minutes
- **Manual Backup**: Settings → Backup → Create Backup
- **Restore**: Settings → Backup → Restore from Backup
- **Export**: Save backups to external location

## Troubleshooting

### Common Issues

**Application won't start:**
- Check if port 3000 is available
- Check error logs in application data folder

**Database locked:**
- Close all instances of the application
- Check if another user has the database open

**Printer not working:**
- Install printer drivers
- Check USB connection
- Verify printer is ESC/POS compatible

**Performance issues:**
- Clean up old backups
- Archive old orders
- Optimize database (Settings → Maintenance)

## Support

- 📧 Email: support@softwrap.com
- 📖 Documentation: [Your docs URL]
- 🐛 Issues: [Your issues URL]

## License

Proprietary - See [LICENSE](LICENSE) file for details.

Copyright © 2024 Softwrap. All rights reserved.

---

Made with ❤️ by Softwrap

# softwrap-pos
