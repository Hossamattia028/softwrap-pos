# Quick Start: Send App to Client (Windows)

## 🚀 Fastest Way (Using GitHub - No Windows PC Needed!)

### Step 1: Initialize Git & Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Softwrap POS"

# Create a GitHub repository at: https://github.com/new
# Then link it:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Wait for Automatic Build

1. Go to your GitHub repository
2. Click "Actions" tab
3. Wait ~5-10 minutes for build to complete
4. Download "Softwrap-POS-Windows-Portable.zip"
5. Extract it and move the `.exe` to your `dist/` folder

### Step 3: Package for Client

```bash
./create-client-package.sh
```

### Step 4: Send to Client

Send the generated `Softwrap-POS-Portable-v1.0.0.zip` file to your client.

**Client instructions:** Extract ZIP, double-click `.exe`, done!

---

## 🔧 Alternative: Using a Windows PC

If you have access to any Windows computer:

### Step 1: Copy Project to Windows

Copy these folders/files to Windows:
- `src/`
- `assets/`
- `package.json`
- `LICENSE`

### Step 2: Build on Windows

```bash
npm install
npm run build:win
```

### Step 3: Get the Portable EXE

In the `dist/` folder, find: `Softwrap POS 1.0.0.exe` (the one WITHOUT "Setup" in the name)

### Step 4: Create Simple Folder

Create folder: `Softwrap-POS-For-Client/`

Add:
- The `.exe` file (rename to just "Softwrap POS.exe")
- A text file with login info:

```
Double-click "Softwrap POS.exe" to start

Login:
Username: admin
Password: admin123

⚠️ Change password after first login!
```

### Step 5: ZIP and Send

Zip the folder and send to your client!

---

## ✅ What Client Does

1. Extract the ZIP file
2. Double-click "Softwrap POS.exe"
3. If Windows warns "Windows protected your PC":
   - Click "More info"
   - Click "Run anyway"
4. Login with admin/admin123
5. Use the application!

**No installation needed. Just click and run.**

---

## 📊 Summary

| Method | Pros | Cons |
|--------|------|------|
| **GitHub Actions** | ✅ No Windows PC needed<br>✅ Automated<br>✅ Free<br>✅ Repeatable | ⏱️ Takes 5-10 min<br>📝 Requires GitHub account |
| **Windows PC** | ✅ Fast<br>✅ Direct control | 💻 Need Windows access |

---

## 🔒 Security

Your source code is **NOT included** in the `.exe` file. It contains only:
- Compiled/bundled application code
- Electron runtime
- Node.js runtime

The client cannot see or extract your source code!

---

## 💡 Need Help?

Read the full guide: `HOW-TO-SEND-TO-CLIENT.md`


