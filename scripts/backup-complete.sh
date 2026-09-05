#!/bin/bash

# Backup completo de PostgreSQL (schema + datos)
# Lee las credenciales del .env

set -e

# Obtener la ruta del directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Leer variables del .env
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
  export $(cat "$PROJECT_ROOT/backend/.env" | grep -v '#' | xargs)
else
  echo "Error: No se encontró el archivo .env en $PROJECT_ROOT/backend/.env"
  exit 1
fi

# Validar que existan las variables necesarias
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_NAME" ]; then
  echo "Error: Variables de base de datos incompletas en .env"
  exit 1
fi

# Crear carpeta de backups si no existe
BACKUP_DIR="$PROJECT_ROOT/database/database/backups"
mkdir -p "$BACKUP_DIR"

# Generar nombre del archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_complete_${TIMESTAMP}.sql"

echo "Iniciando backup completo de $DB_NAME..."
echo "Host: $DB_HOST"
echo "Puerto: $DB_PORT"
echo "Usuario: $DB_USERNAME"
echo "Archivo: $BACKUP_FILE"

# Realizar el backup
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USERNAME" \
  -d "$DB_NAME" \
  --verbose \
  > "$BACKUP_FILE"

echo "✓ Backup completo finalizado exitosamente"
echo "Archivo: $BACKUP_FILE"
echo "Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
