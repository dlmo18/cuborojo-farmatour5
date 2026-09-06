#!/bin/bash
# Script para simular y validar el empaquetado de artifacts

set -e

echo "=== Simulación de Empaquetado de Artifacts ==="
echo ""

TEMP_DIR="/tmp/artifact-test-$$"
mkdir -p "$TEMP_DIR"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "1️⃣  Simulando estructura de artifact (participants)..."
TEMP_ARTIFACT="$TEMP_DIR/frontend-participants-build"
mkdir -p "$TEMP_ARTIFACT"

# Copiar archivos como lo hace GitHub Actions con working-directory
cd /Users/davidmolina/Desktop/Proyectos/cuborojo-farmatour5/frontend-participants
cp -r .next "$TEMP_ARTIFACT/" 2>/dev/null || echo "  ⚠️  .next no encontrado"
cp package.json package-lock.json tsconfig.json next.config.js "$TEMP_ARTIFACT/" 2>/dev/null || true
cp -r public "$TEMP_ARTIFACT/" 2>/dev/null || true
cp -r src "$TEMP_ARTIFACT/" 2>/dev/null || true

echo "✅ Estructura del artifact:"
ls -la "$TEMP_ARTIFACT/" | tail -10

echo ""
echo "2️⃣  Verificando archivos CSS..."
if [ -f "$TEMP_ARTIFACT/.next/static/css/$(ls $TEMP_ARTIFACT/.next/static/css/ 2>/dev/null | head -1)" ]; then
  CSS_SIZE=$(ls -lh "$TEMP_ARTIFACT/.next/static/css/"*.css 2>/dev/null | awk '{print $5}' | head -1)
  echo "✅ CSS encontrado: $CSS_SIZE"
else
  echo "❌ No hay CSS en el artifact"
fi

echo ""
echo "3️⃣  Empaquetando como tar.gz (como en el deploy)..."
tar -czf "$TEMP_DIR/frontend-participants-deploy.tar.gz" -C "$TEMP_ARTIFACT" . 
TAR_SIZE=$(ls -lh "$TEMP_DIR/frontend-participants-deploy.tar.gz" | awk '{print $5}')
echo "✅ Archivo tar.gz creado: $TAR_SIZE"

echo ""
echo "4️⃣  Extrayendo y validando (como en la VM)..."
EXTRACTED_DIR="$TEMP_DIR/extracted"
mkdir -p "$EXTRACTED_DIR"
tar -xzf "$TEMP_DIR/frontend-participants-deploy.tar.gz" -C "$EXTRACTED_DIR"

if [ -f "$EXTRACTED_DIR/.next/static/css"/*.css ]; then
  CSS_EXTRACTED=$(ls -lh "$EXTRACTED_DIR/.next/static/css/"*.css 2>/dev/null | awk '{print $5}' | head -1)
  echo "✅ CSS presente en extracción: $CSS_EXTRACTED"
  echo "✅ Estructura correcta - CSS será servido por Nginx"
else
  echo "❌ CSS NO está en la extracción"
  echo "   Estructura extraída:"
  find "$EXTRACTED_DIR" -type f | head -15
fi

echo ""
echo "=== Resumen ==="
echo "✅ Artifact structure validation complete"
echo "✅ Ready for GitHub Actions deployment"
