#!/bin/bash
# Health check script for Farmatour5
# Monitors all services and sends alerts

SERVICES=(
  "farmatour5-backend:3001"
  "farmatour5-participants:3000"
  "farmatour5-manager:3002"
)

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="farmatour5"
DB_NAME="farmatour5"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HEALTH_LOG="/var/www/farmatour5/logs/health-check.log"

echo "[${TIMESTAMP}] Starting health check..." >> $HEALTH_LOG

# Check Node applications
echo "Checking services..."
for service in "${SERVICES[@]}"; do
  IFS=':' read -r name port <<< "$service"
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ $name (port $port) - Running${NC}"
    echo "[${TIMESTAMP}] ✅ $name running" >> $HEALTH_LOG
  else
    echo -e "${RED}❌ $name (port $port) - STOPPED${NC}"
    echo "[${TIMESTAMP}] ❌ $name stopped" >> $HEALTH_LOG
  fi
done

# Check PostgreSQL
echo -e "\nChecking database..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" >/dev/null 2>&1; then
  echo -e "${GREEN}✅ PostgreSQL - Connected${NC}"
  echo "[${TIMESTAMP}] ✅ PostgreSQL connected" >> $HEALTH_LOG
else
  echo -e "${RED}❌ PostgreSQL - Connection failed${NC}"
  echo "[${TIMESTAMP}] ❌ PostgreSQL connection failed" >> $HEALTH_LOG
fi

# Check Nginx
echo -e "\nChecking web server..."
if systemctl is-active --quiet nginx; then
  echo -e "${GREEN}✅ Nginx - Running${NC}"
  echo "[${TIMESTAMP}] ✅ Nginx running" >> $HEALTH_LOG
else
  echo -e "${RED}❌ Nginx - STOPPED${NC}"
  echo "[${TIMESTAMP}] ❌ Nginx stopped" >> $HEALTH_LOG
fi

# Check system resources
echo -e "\nSystem Resources:"
DISK_USAGE=$(df / | awk 'NR==2 {print $5}')
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f\n", $3/$2 * 100}')

echo "  Disk: ${DISK_USAGE}"
echo "  Memory: ${MEM_USAGE}%"
echo "[${TIMESTAMP}] Disk: ${DISK_USAGE}, Memory: ${MEM_USAGE}%" >> $HEALTH_LOG

# Check API endpoint
echo -e "\nChecking API health..."
if curl -s http://localhost:3001/health | grep -q "OK"; then
  echo -e "${GREEN}✅ API /health - OK${NC}"
  echo "[${TIMESTAMP}] ✅ API healthy" >> $HEALTH_LOG
else
  echo -e "${YELLOW}⚠️  API /health - Slow or unreachable${NC}"
  echo "[${TIMESTAMP}] ⚠️ API slow/unreachable" >> $HEALTH_LOG
fi

echo "[${TIMESTAMP}] Health check completed" >> $HEALTH_LOG
echo "---" >> $HEALTH_LOG
