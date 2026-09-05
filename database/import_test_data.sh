#!/bin/bash

# Script para importar datos de prueba a PostgreSQL
# Uso: ./import_test_data.sh [usuario] [password] [host] [puerto]

# Parámetros por defecto
DB_USER="${1:-postgres}"
DB_PASS="${2:-}"
DB_HOST="${3:-localhost}"
DB_PORT="${4:-5432}"
DB_NAME="farmatour5"
SQL_FILE="$(dirname "$0")/test_data_complete.sql"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Importador de Datos de Prueba - Farmatour5"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Configuración:"
echo "   Usuario:  $DB_USER"
echo "   Host:     $DB_HOST"
echo "   Puerto:   $DB_PORT"
echo "   BD:       $DB_NAME"
echo "   Archivo:  $SQL_FILE"
echo ""

# Verificar que el archivo existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: No se encontró el archivo $SQL_FILE"
    exit 1
fi

echo "⏳ Importando datos..."
echo ""

# Si se proporciona password, usar PGPASSWORD
if [ -n "$DB_PASS" ]; then
    export PGPASSWORD="$DB_PASS"
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$SQL_FILE" 2>&1
    unset PGPASSWORD
else
    # Sin password (usa .pgpass o pide interactivamente)
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$SQL_FILE" 2>&1
fi

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Importación completada exitosamente!"
    echo ""
    echo "📊 Verificando datos importados..."
    
    # Contar registros (sin password por seguridad)
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
    SELECT 
        (SELECT COUNT(*) FROM missions) as misiones,
        (SELECT COUNT(*) FROM mission_items) as contenidos,
        (SELECT COUNT(*) FROM questions) as preguntas,
        (SELECT COUNT(*) FROM answer_options) as opciones,
        (SELECT COUNT(*) FROM golden_level_questions) as preguntas_doradas,
        (SELECT COUNT(*) FROM final_level_questions) as preguntas_finales;
    " 2>/dev/null || echo "   (No se pudo conectar para verificar)"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Error durante la importación"
    echo ""
    echo "💡 Sugerencias:"
    echo "   1. Verifica que PostgreSQL está en ejecución"
    echo "   2. Verifica que la BD 'farmatour5' existe"
    echo "   3. Verifica las credenciales (usuario/contraseña)"
    echo "   4. Verifica que el schema está actualizado"
    echo ""
    exit 1
fi
