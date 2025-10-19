# How to Send Your Application to Windows Client

## Simple Process (3 Steps)

### Step 1: Build Windows Portable Version

You have **2 options**:

#### Option A: Using GitHub Actions (Recommended - No Windows PC Needed!)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Windows build"
   git push
   ```

2. **GitHub will automatically build it:**
   - Go to your GitHub repository
   - Click the "Actions" tab
   - Wait for the build to complete (~5-10 minutes)
   - Click on the completed workflow
   - Download "Softwrap-POS-Windows-Portable.zip"

3. **Extract and place the .exe file:**
   - Extract the downloaded ZIP
   - Move the `.exe` file to your `dist/` folder

#### Option B: Build on a Windows PC

If you have access to Windows:
```bash
npm install
npm run build:win
```
The portable `.exe` will be created in `dist/` folder.

---

### Step 2: Create Client Package

Run the packaging script:
```bash
./create-client-package.sh
```

This creates a ZIP file: `Softwrap-POS-Portable-v1.0.0.zip`

---

### Step 3: Send to Client

Send the ZIP file via:
- Email (if file size allows)
- Google Drive / Dropbox / OneDrive
- WeTransfer
- USB drive

Tell your client:
```
1. Extract the ZIP file
2. Double-click "Softwrap POS.exe"
3. Login: admin / admin123
4. That's it!
```

---

## What the Client Gets

```
Softwrap-POS-Portable-v1.0.0.zip
└── Softwrap-POS-For-Client/
    ├── Softwrap POS.exe          ← Client clicks this!
    └── START-HERE.txt            ← Simple instructions
```

**No installation required!** Client just double-clicks the .exe and it runs.

---

## Important Notes

### For You:
- The portable version bundles everything into one `.exe` file
- No source code is included - only the compiled application
- File size will be ~150-200 MB (includes Electron + Node + your app)

### For Your Client:
- First run will show "Windows protected your PC" warning (normal for unsigned apps)
  - Client clicks "More info" → "Run anyway"
- Application will create its database automatically on first run
- Data is saved in: `C:\Users\[Username]\AppData\Roaming\softwrap-pos\`
- No admin rights needed to run
- Can copy to USB and run from anywhere

---

## Troubleshooting

### "I don't have GitHub"
You need a Windows PC to build the portable version, or:
1. Create a free GitHub account
2. Push your code
3. Use GitHub Actions (free for public repos)

### "The .exe file is too big to email"
Use file sharing services:
- Google Drive
- Dropbox
- WeTransfer (free up to 2GB)
- OneDrive

### "Client says it won't run"
Common issues:
1. **Windows SmartScreen warning:**
   - Click "More info" → "Run anyway"
   
2. **Antivirus blocking:**
   - Add exception in antivirus
   - For production, get code signing certificate

3. **Old Windows version:**
   - Requires Windows 10 or higher (64-bit)

---

## Future Updates

When you want to send an updated version:

1. Update version in `package.json`: `"version": "1.0.1"`
2. Rebuild the Windows portable version
3. Run `./create-client-package.sh` again
4. Send new ZIP to client
5. Client just replaces the old `.exe` with the new one
6. **Data is preserved automatically!** (stored separately)

---

## Security Note

The portable `.exe` is a **compiled application** that contains:
- ✅ Your application code (compiled/minified)
- ✅ Electron runtime
- ✅ Node.js runtime
- ✅ All dependencies

The client **cannot see or access your source code** - it's bundled and compiled!

---

## Summary

**Easiest method:**
1. Push code to GitHub
2. Download built `.exe` from GitHub Actions
3. Run `./create-client-package.sh`
4. Send ZIP to client
5. Client extracts and double-clicks `.exe`

**Done!** 🎉


