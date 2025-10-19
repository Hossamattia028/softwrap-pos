# How to Host Softwrap POS Online (Web Version)

## 🌐 Overview

I've converted your Electron app to also work as a **web application** so your client can try it in their browser without downloading anything!

---

## 🚀 Quick Start (Test Locally First)

### Step 1: Install Web Dependencies

```bash
npm install
```

### Step 2: Start the Web Server

```bash
npm run web
```

### Step 3: Open in Browser

Open: **http://localhost:3000**

Login with: **admin / admin123**

**That's it!** Your client can now access it in a browser!

---

## 🌍 Host Online (3 Easy Options)

### Option 1: Railway (Easiest - Free Tier Available)

1. **Create account:** https://railway.app
2. **Click "New Project" → "Deploy from GitHub"**
3. **Connect your GitHub repo**
4. **Railway auto-detects and deploys!**
5. **Get your URL:** `https://your-app.railway.app`

**Send this URL to your client!**

---

### Option 2: Heroku (Popular - Free Tier)

1. **Create account:** https://heroku.com
2. **Install Heroku CLI**
3. **Deploy:**

```bash
# Login to Heroku
heroku login

# Create app
heroku create softwrap-pos-demo

# Deploy
git push heroku main

# Get your URL
heroku open
```

Your app will be at: `https://softwrap-pos-demo.herokuapp.com`

---

### Option 3: DigitalOcean / Your Own VPS

#### A) Create a Droplet

1. Go to: https://digitalocean.com
2. Create Ubuntu 22.04 droplet ($5/month)
3. SSH into your server

#### B) Install Requirements

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### C) Deploy Your App

```bash
# Clone or upload your code
cd /var/www
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git softwrap-pos
cd softwrap-pos

# Install dependencies
npm install --production

# Start with PM2
pm2 start src/web-server/server.js --name softwrap-pos
pm2 save
pm2 startup

# Setup firewall
sudo ufw allow 3000
```

#### D) Setup Nginx (Optional - for custom domain)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/softwrap-pos
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/softwrap-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo ufw allow 'Nginx Full'
```

---

## 🔧 Environment Variables

For production, set these environment variables:

```bash
# Port (default: 3000)
PORT=3000

# Session secret (change this!)
SESSION_SECRET=your-super-secret-random-string-here

# Node environment
NODE_ENV=production
```

### On Railway/Heroku:
Set in dashboard under "Environment Variables"

### On VPS:
Create `.env` file:

```bash
cd /var/www/softwrap-pos
nano .env
```

Add:

```
PORT=3000
SESSION_SECRET=change-this-to-random-secure-string
NODE_ENV=production
```

---

## 📤 Easiest Method: Use Ngrok (Temporary Demo)

If you just want a **quick temporary link** for your client to test:

### Step 1: Install Ngrok

```bash
# Download from https://ngrok.com
# Or install:
sudo snap install ngrok
```

### Step 2: Start Your Local Server

```bash
npm run web
```

### Step 3: Expose with Ngrok

```bash
ngrok http 3000
```

### Step 4: Send the URL to Client

Ngrok will give you a URL like: `https://abc123.ngrok.io`

**Send this URL to your client!** They can access it immediately.

⚠️ **Note:** Free ngrok URLs expire after 2 hours and change each time.

---

## 🎯 Summary: Fastest Methods

| Method | Time | Cost | Best For |
|--------|------|------|----------|
| **Ngrok** | 2 min | Free | Quick demo/testing |
| **Railway** | 5 min | Free tier | Permanent demo |
| **Heroku** | 10 min | Free tier | Permanent demo |
| **VPS** | 30 min | $5/month | Production use |

---

## 📋 What Your Client Needs to Do

Send your client this message:

```
Hi!

Try my POS system here:
https://your-app-url.com

Login:
Username: admin
Password: admin123

It works in any web browser!
No installation needed.
```

---

## 🔒 Security Notes

### For Demo/Testing:
- Current setup is fine
- Client can test all features

### For Production:
1. **Change SESSION_SECRET** to random string
2. **Use HTTPS** (Railway/Heroku do this automatically)
3. **Change default password** immediately
4. **Add rate limiting** for login attempts
5. **Consider adding authentication tokens**

---

## ⚙️ Features in Web Version

✅ Login/Authentication
✅ Product Management
✅ Orders/Sales
✅ Expenses Tracking
✅ Reports & Analytics
✅ Settings
✅ User Management
✅ Backup Management
✅ Multi-user sessions

❌ Thermal Printer (desktop only)
❌ USB device access (desktop only)

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Check if server is running: `npm run web`
- Check firewall: `sudo ufw status`

### "Session keeps logging out"
- Set SESSION_SECRET environment variable
- Check cookie settings in production

### "Database errors"
- Make sure SQLite is supported
- Check file permissions
- For production, consider PostgreSQL

---

## 📦 Production Checklist

- [ ] Set SESSION_SECRET environment variable
- [ ] Set NODE_ENV=production
- [ ] Use process manager (PM2)
- [ ] Setup automatic restarts
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Add HTTPS/SSL
- [ ] Change default admin password
- [ ] Test on mobile browsers

---

## 🎉 You're Done!

Choose your method above and your client can start testing immediately!

**Recommended for quick demo:** Use Ngrok (2 minutes)
**Recommended for permanent hosting:** Use Railway (5 minutes)


