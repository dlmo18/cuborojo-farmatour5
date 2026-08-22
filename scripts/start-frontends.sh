#!/bin/bash

# Script para iniciar ambos frontends de Farmatour5
# Ejecuta frontend-participants y frontend-manager en modo desarrollo

echo "════════════════════════════════════════════════════════════"
echo "🚀 INICIANDO FRONTENDS - FARMATOUR5"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Verificar que node_modules exista en ambos frontends
echo "🔍 Verificando dependencias..."
echo ""

if [ ! -d "frontend-participants/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias de frontend-participants...${NC}"
    cd frontend-participants && npm install
    cd ..
fi

if [ ! -d "frontend-manager/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias de frontend-manager...${NC}"
    cd frontend-manager && npm install
    cd ..
fi

echo -e "${GREEN}✅ Dependencias OK${NC}"
echo ""

# Función para manejar la salida
cleanup() {
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "🛑 Deteniendo frontends..."
    echo "════════════════════════════════════════════════════════════"
    jobs -p | xargs kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "════════════════════════════════════════════════════════════"
echo "🎮 Iniciando Frontend Participantes..."
echo "════════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT/frontend-participants"
npm run dev > /tmp/farmatour5-participants.log 2>&1 &
PARTICIPANTS_PID=$!

sleep 3

# Buscar el puerto en el log
PARTICIPANTS_PORT=$(grep -o "localhost:[0-9]*" /tmp/farmatour5-participants.log | head -1 | cut -d: -f2)
if [ -z "$PARTICIPANTS_PORT" ]; then
    PARTICIPANTS_PORT="3000"
fi

echo -e "${GREEN}✅ Frontend Participantes iniciado${NC}"
echo -e "${BLUE}   URL: http://localhost:$PARTICIPANTS_PORT${NC}"
echo -e "   Log: /tmp/farmatour5-participants.log"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "⚙️  Iniciando Frontend Manager..."
echo "════════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT/frontend-manager"
npm run dev > /tmp/farmatour5-manager.log 2>&1 &
MANAGER_PID=$!

sleep 3

# Buscar el puerto en el log
MANAGER_PORT=$(grep -o "localhost:[0-9]*" /tmp/farmatour5-manager.log | head -1 | cut -d: -f2)
if [ -z "$MANAGER_PORT" ]; then
    MANAGER_PORT="3002"
fi

echo -e "${GREEN}✅ Frontend Manager iniciado${NC}"
echo -e "${BLUE}   URL: http://localhost:$MANAGER_PORT${NC}"
echo -e "   Log: /tmp/farmatour5-manager.log"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✅ AMBOS FRONTENDS EN EJECUCIÓN"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Frontend Participantes:${NC} http://localhost:$PARTICIPANTS_PORT"
echo -e "${GREEN}Frontend Manager:${NC}       http://localhost:$MANAGER_PORT"
echo ""
echo "📝 Logs disponibles en:"
echo "   - /tmp/farmatour5-participants.log"
echo "   - /tmp/farmatour5-manager.log"
echo ""
echo "⚠️  Para detener ambos frontends, presiona Ctrl+C"
echo ""
echo "════════════════════════════════════════════════════════════"

# Mantener el script vivo y mostrar logs en tiempo real
tail -f /tmp/farmatour5-participants.log /tmp/farmatour5-manager.log &
TAIL_PID=$!

# Esperar indefinidamente
wait $PARTICIPANTS_PID $MANAGER_PID $TAIL_PID
