#!/bin/bash

# Script de verificación de frontends Farmatour5
# Verifica que ambos frontends (participants y manager) compilen sin errores

echo "════════════════════════════════════════════════════════════"
echo "🔍 VERIFICACIÓN DE FRONTENDS - FARMATOUR5"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar un frontend
verify_frontend() {
    local dir=$1
    local name=$2
    local port=$3
    
    echo "📦 Verificando: $name"
    echo "----------------------------------------"
    
    cd "$dir" || exit 1
    
    # Verificar que existan los archivos necesarios
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ ERROR: No existe package.json${NC}"
        return 1
    fi
    
    if [ ! -f "src/app/globals.css" ]; then
        echo -e "${RED}❌ ERROR: No existe globals.css${NC}"
        return 1
    fi
    
    if [ ! -f "postcss.config.js" ]; then
        echo -e "${RED}❌ ERROR: No existe postcss.config.js${NC}"
        return 1
    fi
    
    if [ ! -f "tailwind.config.ts" ]; then
        echo -e "${RED}❌ ERROR: No existe tailwind.config.ts${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Archivos de configuración OK${NC}"
    
    # Verificar node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules no existe, ejecutando npm install...${NC}"
        npm install
    else
        echo -e "${GREEN}✅ node_modules existe${NC}"
    fi
    
    # Verificar que Tailwind esté instalado
    if [ ! -d "node_modules/tailwindcss" ]; then
        echo -e "${RED}❌ ERROR: Tailwind CSS no instalado${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Dependencias OK${NC}"
    
    # Intentar compilar
    echo "🔨 Compilando..."
    npm run build > /tmp/build_${name}.log 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build exitoso${NC}"
    else
        echo -e "${RED}❌ ERROR en build${NC}"
        echo "Ver log: /tmp/build_${name}.log"
        tail -20 /tmp/build_${name}.log
        return 1
    fi
    
    echo ""
    cd - > /dev/null
    return 0
}

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Verificar frontend-participants
verify_frontend "frontend-participants" "Frontend Participantes" "3000"
PARTICIPANTS_RESULT=$?

# Verificar frontend-manager
verify_frontend "frontend-manager" "Frontend Manager" "3002"
MANAGER_RESULT=$?

echo "════════════════════════════════════════════════════════════"
echo "📊 RESUMEN"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $PARTICIPANTS_RESULT -eq 0 ]; then
    echo -e "Frontend Participantes: ${GREEN}✅ OK${NC}"
else
    echo -e "Frontend Participantes: ${RED}❌ ERROR${NC}"
fi

if [ $MANAGER_RESULT -eq 0 ]; then
    echo -e "Frontend Manager:       ${GREEN}✅ OK${NC}"
else
    echo -e "Frontend Manager:       ${RED}❌ ERROR${NC}"
fi

echo ""

# Resultado final
if [ $PARTICIPANTS_RESULT -eq 0 ] && [ $MANAGER_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 VERIFICACIÓN EXITOSA - Ambos frontends están listos${NC}"
    echo ""
    echo "Para ejecutarlos:"
    echo "  - Frontend Participantes: cd frontend-participants && npm run dev"
    echo "  - Frontend Manager:       cd frontend-manager && npm run dev"
    exit 0
else
    echo -e "${RED}❌ VERIFICACIÓN FALLIDA - Revisa los errores arriba${NC}"
    exit 1
fi
