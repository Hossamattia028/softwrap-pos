#!/bin/bash

# Nginx Setup Script for Softwrap POS
# Run this AFTER deploy-vps.sh to add Nginx reverse proxy

echo "🔧 Softwrap POS - Nginx Setup"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run with sudo: sudo ./setup-nginx.sh"
  exit 1
fi

# Get domain or IP
echo ""
read -p "Enter your domain name (or press Enter to use server IP): " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN=$(curl -s ifconfig.me)
    echo -e "${YELLOW}Using IP address: $DOMAIN${NC}"
fi

echo ""
echo -e "${YELLOW}Installing Nginx...${NC}"
apt-get update
apt-get install -y nginx
echo -e "${GREEN}✓ Nginx installed${NC}"

echo ""
echo -e "${YELLOW}Creating Nginx configuration...${NC}"

cat > /etc/nginx/sites-available/softwrap-pos << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Increase upload size for backups
    client_max_body_size 100M;
}
EOF

echo -e "${GREEN}✓ Configuration created${NC}"

echo ""
echo -e "${YELLOW}Enabling site...${NC}"
ln -sf /etc/nginx/sites-available/softwrap-pos /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo ""
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Configuration is valid${NC}"
    
    echo ""
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx started${NC}"
else
    echo -e "${RED}✗ Configuration error${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Nginx Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Your application is now accessible at:"
echo "  → http://$DOMAIN"
echo ""
echo "To add SSL/HTTPS (recommended):"
echo "  1. Install certbot:"
echo "     sudo apt install certbot python3-certbot-nginx"
echo ""
echo "  2. Get SSL certificate:"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  3. Certbot will auto-configure HTTPS!"
echo ""

