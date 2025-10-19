#!/bin/bash

# VPS Deployment Script for Softwrap POS Web Server
# Run this on your VPS after uploading the code

echo "🚀 Softwrap POS - VPS Deployment Script"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run with sudo: sudo ./deploy-vps.sh"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Installing Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js installed${NC}"
else
    echo -e "${GREEN}✓ Node.js already installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Installing PM2 Process Manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Step 4: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file - Please edit it and set SESSION_SECRET!${NC}"
    echo "   Run: nano .env"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Starting application with PM2...${NC}"
pm2 stop softwrap-pos 2>/dev/null || true
pm2 delete softwrap-pos 2>/dev/null || true
pm2 start src/web-server/server.js --name softwrap-pos
pm2 save
echo -e "${GREEN}✓ Application started${NC}"

echo ""
echo -e "${YELLOW}Step 6: Setting up PM2 to start on boot...${NC}"
pm2 startup | tail -n 1 | bash
echo -e "${GREEN}✓ PM2 startup configured${NC}"

echo ""
echo -e "${YELLOW}Step 7: Configuring firewall...${NC}"
ufw allow 3000
ufw allow 80
ufw allow 443
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Your application is now running!"
echo ""
echo "Access it at:"
echo "  → http://YOUR-SERVER-IP:3000"
echo ""
echo "Default login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Edit .env file and change SESSION_SECRET:"
echo "   sudo nano .env"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart app"
echo "  pm2 stop all        - Stop app"
echo ""
echo "To setup Nginx reverse proxy (optional):"
echo "  Run: sudo ./setup-nginx.sh"
echo ""

