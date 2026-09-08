#!/bin/bash
# Farmatour5 Deployment Script
# Automates complete setup on Google Cloud VM

set -e

echo "🚀 Farmatour5 Deployment Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}"
   exit 1
fi

# Configuration
DOMAIN="farmatour5.com"
APP_USER="farmatour5"
APP_DIR="/var/www/farmatour5"
DB_USER="farmatour5"
DB_PASS="${DB_PASS:-farmatour5pass}"  # Change this!
DB_NAME="farmatour5"
NODE_VERSION="18"
GIT_REPO="${GIT_REPO:-}"  # Your Git repository

echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App Dir: $APP_DIR"
echo "  DB User: $DB_USER"

# Step 1: System Update
echo -e "\n${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y && apt autoremove -y

# Step 2: Install Node.js
echo -e "\n${YELLOW}[2/10] Installing Node.js $NODE_VERSION...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs build-essential python3-dev

# Step 3: Install PostgreSQL
echo -e "\n${YELLOW}[3/10] Installing PostgreSQL...${NC}"
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update && apt install -y postgresql-14 postgresql-contrib-14
systemctl start postgresql && systemctl enable postgresql

# Step 4: Install Nginx
echo -e "\n${YELLOW}[4/10] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx && systemctl enable nginx

# Step 5: Install other tools
echo -e "\n${YELLOW}[5/10] Installing utilities...${NC}"
apt install -y git curl wget certbot python3-certbot-nginx

# Step 6: Install PM2
echo -e "\n${YELLOW}[6/10] Installing PM2...${NC}"
npm install -g pm2
pm2 completion install || true

# Step 7: Create application user and directories
echo -e "\n${YELLOW}[7/10] Setting up application structure...${NC}"
useradd -m -s /bin/bash $APP_USER 2>/dev/null || echo "User $APP_USER already exists"
mkdir -p $APP_DIR/{backend,frontend-participants,frontend-manager,uploads,logs,ssl,database,backups}
chown -R $APP_USER:$APP_USER $APP_DIR
chmod 755 $APP_DIR
chmod 777 $APP_DIR/uploads $APP_DIR/logs $APP_DIR/backups

# Step 8: Setup PostgreSQL
echo -e "\n${YELLOW}[8/10] Configuring PostgreSQL...${NC}"
sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
ALTER USER $DB_USER CREATEDB;
GRANT CONNECT ON DATABASE $DB_NAME TO $DB_USER;
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;
EOF

# Step 9: Clone/Setup repositories
if [ -n "$GIT_REPO" ]; then
  echo -e "\n${YELLOW}[9/10] Cloning repositories...${NC}"
  cd $APP_DIR
  # Clone backend
  git clone $GIT_REPO backend 2>/dev/null || echo "Backend already cloned"
  # Clone frontends (adjust as needed)
  # git clone ${GIT_REPO%-backend}* frontend-* 2>/dev/null || true
fi

# Step 10: Setup Nginx configuration
echo -e "\n${YELLOW}[10/10] Configuring Nginx...${NC}"
if [ -f "$APP_DIR/nginx/farmatour5.conf" ]; then
  ln -sf $APP_DIR/nginx/farmatour5.conf /etc/nginx/sites-available/farmatour5.conf
  ln -sf /etc/nginx/sites-available/farmatour5.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
  nginx -t && systemctl restart nginx || echo "Nginx config needs manual review"
fi

echo -e "\n${GREEN}✅ Basic setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Load database schema:"
echo "   psql -U $DB_USER -d $DB_NAME -f $APP_DIR/database/schema.sql"
echo ""
echo "2. Setup backend:"
echo "   cd $APP_DIR/backend"
echo "   npm install"
echo "   Create .env file"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "3. Setup frontends (participants and manager):"
echo "   npm install && npm run build"
echo "   pm2 start [app name]"
echo ""
echo "4. Setup SSL certificate:"
echo "   sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "5. Verify installation:"
echo "   pm2 status"
echo "   curl -I https://localhost/health"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "- Architecture: $APP_DIR/docs/ARQUITECTURA.md"
echo "- Installation: $APP_DIR/docs/MANUAL_INSTALACION.md"

exit 0
