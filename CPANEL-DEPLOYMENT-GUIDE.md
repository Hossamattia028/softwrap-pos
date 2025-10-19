# How to Deploy Softwrap POS to cPanel

## 📋 Prerequisites

Before starting, make sure your cPanel hosting has:
- ✅ Node.js support (version 14 or higher)
- ✅ SSH access (optional but recommended)
- ✅ At least 500MB free space
- ✅ A domain or subdomain

---

## 🚀 Method 1: Using cPanel File Manager (Easiest)

### Step 1: Prepare Your Files

First, create a clean package without unnecessary files:

```bash
cd /media/hossam-attia/data/desktop_application/main_pos

# Create deployment package
zip -r softwrap-pos-deploy.zip \
  src/ \
  assets/ \
  package.json \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/.git/*"
```

### Step 2: Upload to cPanel

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to your public_html** (or subdomain folder)
4. **Create a new folder:** `softwrap-pos`
5. **Enter the folder**
6. **Upload** `softwrap-pos-deploy.zip`
7. **Extract** the zip file
8. **Delete** the zip file after extraction

### Step 3: Setup Node.js Application

1. **In cPanel, find "Setup Node.js App"**
2. **Click "Create Application"**
3. **Fill in the form:**
   - **Node.js version:** Select latest (18.x or 16.x)
   - **Application mode:** Production
   - **Application root:** `softwrap-pos`
   - **Application URL:** Choose your domain/subdomain
   - **Application startup file:** `src/web-server/server.js`
   - **Application port:** `3000` (or any available port)

4. **Click "Create"**

### Step 4: Install Dependencies

After creating the app, you'll see a command to enter the virtual environment.

**Copy the command** (looks like this):
```bash
source /home/username/nodevenv/softwrap-pos/18/bin/activate && cd /home/username/softwrap-pos
```

1. **Open "Terminal" in cPanel**
2. **Paste and run** the virtual environment command
3. **Install dependencies:**
```bash
npm install --production
npm rebuild bcrypt better-sqlite3
```

### Step 5: Configure Environment Variables

In the Node.js App interface:

1. **Click "Edit" on your application**
2. **Scroll to "Environment Variables"**
3. **Add these variables:**

```
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-random-secret-here-change-this
```

**Important:** Replace `your-random-secret-here-change-this` with a random string!

### Step 6: Start the Application

1. **In the Node.js App interface, click "Start App"**
2. **Wait for the green status indicator**
3. **Your app is now live!**

### Step 7: Access Your Application

Visit your domain/subdomain:
- `https://yourdomain.com/softwrap-pos`
- OR `https://pos.yourdomain.com`

Login with: `admin` / `admin123`

---

## 🚀 Method 2: Using SSH (Advanced, Faster)

### Step 1: Connect via SSH

```bash
ssh username@yourdomain.com
```

### Step 2: Upload Your Code

**Option A: Using Git (Recommended)**
```bash
cd public_html
git clone https://github.com/your-username/your-repo.git softwrap-pos
cd softwrap-pos
```

**Option B: Using SCP from your local machine**
```bash
# On your local machine
cd /media/hossam-attia/data/desktop_application/main_pos
tar -czf softwrap-pos.tar.gz src/ assets/ package.json
scp softwrap-pos.tar.gz username@yourdomain.com:~/public_html/

# Back on SSH
cd ~/public_html
tar -xzf softwrap-pos.tar.gz -C softwrap-pos
```

### Step 3: Setup via SSH

```bash
cd ~/public_html/softwrap-pos

# Load Node.js version
source /home/username/nodevenv/softwrap-pos/18/bin/activate

# Install dependencies
npm install --production
npm rebuild bcrypt better-sqlite3

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -base64 32)
EOF
```

### Step 4: Setup Node.js App in cPanel

Follow Step 3 from Method 1, but select "Register an existing application"

---

## 🔧 Configuration Files for cPanel

Create these files in your project root:

### 1. `.htaccess` (for subdirectory access)

Create in your application folder:

```apache
# .htaccess
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

### 2. `.cpanel.yml` (for automatic deployment)

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/username/public_html/softwrap-pos
    - /bin/cp -R * $DEPLOYPATH
    - cd $DEPLOYPATH
    - npm install --production
    - npm rebuild bcrypt better-sqlite3
```

---

## 🌐 Setting Up a Subdomain

### Option 1: Using Subdomain

1. **In cPanel, go to "Subdomains"**
2. **Create subdomain:** `pos.yourdomain.com`
3. **Document Root:** `/home/username/public_html/softwrap-pos`
4. **Update Node.js App URL** to use this subdomain

### Option 2: Using Main Domain

1. **In cPanel, go to "Domains"**
2. **Set document root** to your app folder
3. **Update Node.js App** accordingly

---

## 🔒 Production Security Checklist

Before going live, ensure:

```bash
# 1. Strong session secret
# Edit .env and set a strong SESSION_SECRET

# 2. Change default admin password
# Login and change password immediately

# 3. Disable directory listing
# Add to .htaccess:
Options -Indexes

# 4. Set proper permissions
chmod 755 src/
chmod 644 package.json
chmod 600 .env

# 5. Setup SSL (HTTPS)
# Use cPanel's "SSL/TLS" manager or Let's Encrypt
```

---

## 🐛 Troubleshooting

### Application Won't Start

**Check Node.js App logs in cPanel:**
1. Go to Node.js App interface
2. Click your app
3. Click "Show Log"

**Common issues:**

**Error: "Cannot find module"**
```bash
# Solution: Reinstall dependencies
source /home/username/nodevenv/softwrap-pos/18/bin/activate
cd ~/public_html/softwrap-pos
npm install --production
```

**Error: "Port already in use"**
```bash
# Solution: Choose different port in Node.js App settings
# Or restart the app
```

**Error: "bcrypt/better-sqlite3 binding"**
```bash
# Solution: Rebuild native modules
npm rebuild bcrypt better-sqlite3
```

### Can't Access the Application

**Check:**
1. Node.js App is **running** (green status)
2. Firewall allows the port
3. `.htaccess` is configured correctly
4. Domain/subdomain points to correct folder

### Database Errors

```bash
# Check database file permissions
cd ~/public_html/softwrap-pos
ls -la ~/.softwrap-pos-web/

# If needed, reset database
rm -rf ~/.softwrap-pos-web/
# Restart app - it will create fresh database
```

---

## 📊 Performance Tips

### 1. Enable Gzip Compression

Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript
</IfModule>
```

### 2. Setup Caching

Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### 3. Use PM2 (if supported)

```bash
npm install -g pm2
pm2 start src/web-server/server.js --name softwrap-pos
pm2 save
pm2 startup
```

---

## 🔄 Updating Your Application

### Method 1: Via cPanel File Manager

1. Upload new files
2. Extract/overwrite
3. Restart app in Node.js App interface

### Method 2: Via SSH

```bash
cd ~/public_html/softwrap-pos

# Backup database
cp -r ~/.softwrap-pos-web ~/.softwrap-pos-web.backup

# Pull updates (if using Git)
git pull

# Or upload and extract new files
# ...

# Update dependencies
source /home/username/nodevenv/softwrap-pos/18/bin/activate
npm install --production

# Restart via cPanel Node.js App interface
```

---

## 📱 Tell Your Client

After successful deployment, share with your client:

```
Your POS system is now live at:
https://pos.yourdomain.com

Login credentials:
Username: admin
Password: admin123

⚠️ IMPORTANT: Please change your password immediately after first login!

Features:
✅ Available 24/7
✅ Accessible from any device
✅ Automatic backups
✅ Secure HTTPS connection

For support: your-email@domain.com
```

---

## 📞 Support

If you encounter issues:

1. **Check cPanel error logs**
2. **Check Node.js App logs**
3. **Verify all steps were completed**
4. **Contact your hosting provider** for Node.js support

---

## 🎉 You're Done!

Your Softwrap POS is now running on cPanel! 🚀

**Next steps:**
- ✅ Change admin password
- ✅ Add products
- ✅ Test all features
- ✅ Setup regular backups
- ✅ Monitor performance


