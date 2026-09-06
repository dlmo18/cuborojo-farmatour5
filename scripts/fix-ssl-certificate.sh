#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║  SSL Certificate Diagnostics & Repair Script                     ║
# ║  Farmatour5 UAT - Common Name Mismatch Fix                       ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAINS=("farmatour5-api.cuborojo.pe" "farmatour5-admin.cuborojo.pe" "farmatour5.cuborojo.pe")
CERTBOT_DIR="/var/www/certbot"
NGINX_CONFIG="/etc/nginx/sites-available/farmatour5-uat.conf"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SSL Certificate Diagnostics & Repair${NC}"
echo -e "${BLUE}║  Farmatour5 UAT${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}\n"

# ════════════════════════════════════════════════════════════════════
# STEP 1: DIAGNOSTIC
# ════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}[1/5] DIAGNOSTIC: Checking current certificates...${NC}\n"

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}✗ Certbot not installed${NC}"
    echo "  Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✓ Certbot installed${NC}"
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}✗ Nginx not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Nginx installed${NC}"
fi

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
    echo "  Starting Nginx..."
    sudo systemctl start nginx
    echo -e "${GREEN}✓ Nginx started${NC}"
fi

echo ""

# List current certificates
echo -e "${BLUE}Current certificates:${NC}"
sudo certbot certificates || echo "  No certificates found"

echo ""

# Check each domain certificate
for domain in "${DOMAINS[@]}"; do
    echo -e "${BLUE}Checking: $domain${NC}"
    
    # Get certificate info
    cert_info=$(echo | openssl s_client -connect "$domain:443" 2>/dev/null | \
                 openssl x509 -noout -text 2>/dev/null || echo "")
    
    if [ -z "$cert_info" ]; then
        echo -e "  ${RED}✗ No certificate found for $domain${NC}"
    else
        # Extract Common Name
        cn=$(echo "$cert_info" | grep "Subject:" | grep -oP 'CN=\K[^,]+' || echo "NOT FOUND")
        echo "  Common Name: $cn"
        
        # Extract SANs
        sans=$(echo "$cert_info" | grep -A1 "Subject Alternative Name:" | tail -1 | sed 's/^ *//' || echo "")
        echo "  SANs: $sans"
        
        # Check validity dates
        expiry=$(echo "$cert_info" | grep "Not After" || echo "")
        echo "  $expiry"
        
        # Check if CN matches
        if [[ "$cn" == "$domain" ]]; then
            echo -e "  ${GREEN}✓ Certificate matches domain${NC}"
        else
            echo -e "  ${RED}✗ Certificate MISMATCH!${NC}"
            echo -e "    Expected: $domain"
            echo -e "    Got: $cn"
        fi
    fi
    
    echo ""
done

# Check DNS resolution
echo -e "${BLUE}DNS Resolution:${NC}"
for domain in "${DOMAINS[@]}"; do
    ip=$(nslookup "$domain" 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}' || echo "NOT RESOLVED")
    echo "  $domain → $ip"
done

echo ""

# Check firewall
echo -e "${BLUE}Firewall Status:${NC}"
if command -v ufw &> /dev/null; then
    echo -e "  ${GREEN}✓ UFW installed${NC}"
    if sudo ufw status | grep -q "Status: active"; then
        echo -e "  ${GREEN}✓ UFW is active${NC}"
        echo "  Checking ports..."
        sudo ufw status | grep -E "80|443" || echo "    WARNING: Ports 80/443 may not be open!"
    else
        echo -e "  ${YELLOW}⚠ UFW is inactive${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ UFW not installed${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════
# STEP 2: REPAIR OPTION
# ════════════════════════════════════════════════════════════════════

read -p "$(echo -e ${YELLOW}Proceed with certificate repair? \(y/n\)${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Skipping repair. You can run this script again later.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}[2/5] PREPARATION: Creating directories and setting permissions...${NC}\n"

# Create certbot directory
sudo mkdir -p "$CERTBOT_DIR"
sudo chown -R www-data:www-data "$CERTBOT_DIR"
sudo chmod 755 "$CERTBOT_DIR"
echo -e "${GREEN}✓ Certbot directory prepared${NC}"

# Verify Nginx config
echo -e "\n${YELLOW}[3/5] VERIFICATION: Checking Nginx configuration...${NC}\n"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    echo "  Trying to fix..."
    # Show error
    sudo nginx -t
fi

# Ensure Nginx is running
echo -e "\n${YELLOW}[4/5] OBTAINING: Getting new certificates from Let's Encrypt...${NC}\n"

if ! sudo systemctl is-active --quiet nginx; then
    echo "Starting Nginx..."
    sudo systemctl start nginx
    sleep 2
fi

# Try to obtain certificates
if sudo certbot certonly --webroot -w "$CERTBOT_DIR" \
    -d "${DOMAINS[0]}" \
    -d "${DOMAINS[1]}" \
    -d "${DOMAINS[2]}" \
    --non-interactive --agree-tos --email admin@cuborojo.pe; then
    
    echo -e "\n${GREEN}✓ Certificates obtained successfully${NC}"
else
    echo -e "\n${YELLOW}⚠ Certificate obtention had issues. Trying with --expand...${NC}"
    sudo certbot certonly --webroot -w "$CERTBOT_DIR" \
        -d "${DOMAINS[0]}" \
        -d "${DOMAINS[1]}" \
        -d "${DOMAINS[2]}" \
        --expand --non-interactive --agree-tos --email admin@cuborojo.pe || true
fi

# ════════════════════════════════════════════════════════════════════
# STEP 5: ACTIVATION
# ════════════════════════════════════════════════════════════════════

echo -e "\n${YELLOW}[5/5] ACTIVATION: Reloading Nginx with new certificates...${NC}\n"

# Verify Nginx config again
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    
    # Reload Nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    echo "  Please fix the configuration manually"
    sudo nginx -t
    exit 1
fi

echo ""

# ════════════════════════════════════════════════════════════════════
# FINAL VERIFICATION
# ════════════════════════════════════════════════════════════════════

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  FINAL VERIFICATION${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Verifying certificates...${NC}\n"

all_ok=true

for domain in "${DOMAINS[@]}"; do
    echo -e "${BLUE}$domain:${NC}"
    
    # Get certificate info
    cert_info=$(echo | openssl s_client -connect "$domain:443" 2>/dev/null | \
                 openssl x509 -noout -text 2>/dev/null || echo "")
    
    if [ -z "$cert_info" ]; then
        echo -e "  ${RED}✗ No certificate found${NC}"
        all_ok=false
    else
        # Extract Common Name
        cn=$(echo "$cert_info" | grep "Subject:" | grep -oP 'CN=\K[^,]+' || echo "NOT FOUND")
        
        # Check if CN matches
        if [[ "$cn" == "$domain" ]]; then
            echo -e "  ${GREEN}✓ Certificate matches${NC}"
            
            # Show expiry
            expiry=$(echo "$cert_info" | grep "Not After" | sed 's/^[[:space:]]*//')
            echo "  $expiry"
        else
            echo -e "  ${RED}✗ Certificate MISMATCH${NC}"
            echo "    Expected: $domain"
            echo "    Got: $cn"
            all_ok=false
        fi
    fi
    
    # Try curl test
    if curl -s -I "https://$domain" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ HTTPS accessible${NC}"
    else
        echo -e "  ${YELLOW}⚠ HTTPS test inconclusive${NC}"
    fi
    
    echo ""
done

echo -e "${BLUE}Current certificates:${NC}"
sudo certbot certificates

echo ""

if [ "$all_ok" = true ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ REPAIR SUCCESSFUL!${NC}"
    echo -e "${GREEN}║                                                                   ║${NC}"
    echo -e "${GREEN}║  All certificates are now correctly configured.${NC}"
    echo -e "${GREEN}║  You should now be able to access:${NC}"
    for domain in "${DOMAINS[@]}"; do
        echo -e "${GREEN}║    • https://$domain${NC}"
    done
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ ISSUES REMAIN${NC}"
    echo -e "${RED}║                                                                   ║${NC}"
    echo -e "${RED}║  Some certificates may not be correctly configured.${NC}"
    echo -e "${RED}║  Please review the output above and check:${NC}"
    echo -e "${RED}║    1. DNS resolution (nslookup)${NC}"
    echo -e "${RED}║    2. Firewall settings (ufw status)${NC}"
    echo -e "${RED}║    3. Nginx logs: sudo tail -f /var/log/nginx/error.log${NC}"
    echo -e "${RED}║    4. Certbot logs: sudo tail -f /var/log/letsencrypt/letsencrypt.log${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
