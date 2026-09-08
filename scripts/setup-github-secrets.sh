#!/bin/bash
# GitHub Secrets Configuration Script
# Script para automatizar la creación de secrets en GitHub

set -e

REPO_OWNER="${1:-}"
REPO_NAME="${2:-}"

if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
  echo "❌ Uso: $0 OWNER REPO_NAME"
  echo "   Ejemplo: $0 davidmolina farmatour5-repo"
  exit 1
fi

echo "📋 GitHub Secrets Setup para $REPO_OWNER/$REPO_NAME"
echo "=================================================="

# Verificar gh CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) no está instalado"
  echo "   Instalar desde: https://cli.github.com/"
  exit 1
fi

# Conectar a GitHub
gh auth status || gh auth login

echo ""
echo "📝 Ingresa los valores para cada secret:"
echo ""

# 1. DEPLOY_HOST
read -p "DEPLOY_HOST (IP o dominio del servidor): " DEPLOY_HOST
if [ -z "$DEPLOY_HOST" ]; then
  echo "❌ DEPLOY_HOST no puede estar vacío"
  exit 1
fi

# 2. DEPLOY_USER
read -p "DEPLOY_USER (usuario en servidor, ej: farmatour5): " DEPLOY_USER
DEPLOY_USER="${DEPLOY_USER:-farmatour5}"

# 3. DEPLOY_KEY (SSH Private Key)
read -p "Ruta a SSH private key (ej: ~/.ssh/farmatour5_deploy): " SSH_KEY_PATH
if [ ! -f "$SSH_KEY_PATH" ]; then
  echo "❌ Archivo no encontrado: $SSH_KEY_PATH"
  exit 1
fi

# 4. DEPLOY_BASE_PATH
read -p "DEPLOY_BASE_PATH (ej: /var/www/farmatour5): " DEPLOY_BASE_PATH
DEPLOY_BASE_PATH="${DEPLOY_BASE_PATH:-/var/www/farmatour5}"

# 5. Backend Environment
echo ""
echo "📝 Ingresa valores para BACKEND_ENV:"
read -p "  DB_PASS (contraseña PostgreSQL): " DB_PASS
read -p "  JWT_SECRET (secret para admin, ej: openssl rand -hex 32): " JWT_SECRET
read -p "  JWT_PARTICIPANT_SECRET (secret para participantes): " JWT_PARTICIPANT_SECRET

BACKEND_ENV="DB_HOST=localhost
DB_PORT=5432
DB_USER=farmatour5
DB_PASS=$DB_PASS
DB_NAME=farmatour5
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=8h
JWT_PARTICIPANT_SECRET=$JWT_PARTICIPANT_SECRET
JWT_PARTICIPANT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://farmatour5.com
UPLOAD_DIR=/var/www/farmatour5/uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info"

# 6. Frontend Environment
read -p "FRONTEND_URL (ej: https://farmatour5.com): " FRONTEND_URL
FRONTEND_URL="${FRONTEND_URL:-https://farmatour5.com}"

FRONTEND_PARTICIPANTS_ENV="NEXT_PUBLIC_API_URL=${FRONTEND_URL}/api"
FRONTEND_MANAGER_ENV="NEXT_PUBLIC_API_URL=${FRONTEND_URL}/api"

# Leer SSH key
SSH_KEY_CONTENT=$(cat "$SSH_KEY_PATH")

# Crear secrets en GitHub
echo ""
echo "🔐 Creando secrets en GitHub..."
echo ""

gh secret set DEPLOY_HOST -b "$DEPLOY_HOST" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ DEPLOY_HOST configurado"

gh secret set DEPLOY_USER -b "$DEPLOY_USER" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ DEPLOY_USER configurado"

gh secret set DEPLOY_KEY -b "$SSH_KEY_CONTENT" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ DEPLOY_KEY configurado"

gh secret set DEPLOY_BASE_PATH -b "$DEPLOY_BASE_PATH" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ DEPLOY_BASE_PATH configurado"

gh secret set BACKEND_ENV -b "$BACKEND_ENV" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ BACKEND_ENV configurado"

gh secret set FRONTEND_PARTICIPANTS_ENV -b "$FRONTEND_PARTICIPANTS_ENV" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ FRONTEND_PARTICIPANTS_ENV configurado"

gh secret set FRONTEND_MANAGER_ENV -b "$FRONTEND_MANAGER_ENV" -R "$REPO_OWNER/$REPO_NAME"
echo "✅ FRONTEND_MANAGER_ENV configurado"

echo ""
echo "✅ Todos los secrets han sido configurados!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Verifica los secrets en: Settings → Secrets and variables → Actions"
echo "  2. Haz un commit y push a la rama main para probar el workflow"
echo "  3. Ve a Actions para monitorear el deployment"
echo ""
echo "📖 Para más información, ver MANUAL_CI_CD.md"
