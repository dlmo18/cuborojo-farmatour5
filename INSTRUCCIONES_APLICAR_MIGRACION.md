# 🔧 Instrucciones: Aplicar Migración del Schema

**Fecha**: 2026-09-25  
**Archivo**: `database/migrations/add_missing_mission_items_columns.sql`  
**Duración estimada**: < 1 segundo

---

## ⚡ Forma Rápida (Recomendada)

### Opción 1: Desde línea de comandos

```bash
# Conectarse a la base de datos y ejecutar migración
psql -U tu_usuario -d nombre_base_datos -h localhost -f database/migrations/add_missing_mission_items_columns.sql
```

### Opción 2: En pgAdmin
1. Abre pgAdmin
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos
4. Haz clic en "Query Tool"
5. Abre el archivo `database/migrations/add_missing_mission_items_columns.sql`
6. Ejecuta (F5 o botón ▶️)

### Opción 3: En el cliente SQL
```sql
-- Copia y pega el contenido de:
-- database/migrations/add_missing_mission_items_columns.sql
```

---

## 📋 Verificación Paso a Paso

### Paso 1: Conectar a la BD
```bash
psql -U tu_usuario -d nombre_base_datos
```

### Paso 2: Ver estructura antes
```sql
\d mission_items
```

Deberías ver 11 columnas.

### Paso 3: Ejecutar migración
```sql
-- Opción A: Desde archivo
\i database/migrations/add_missing_mission_items_columns.sql

-- Opción B: Inline
ALTER TABLE "public"."mission_items" 
ADD COLUMN IF NOT EXISTS "family" character varying(255),
ADD COLUMN IF NOT EXISTS "is_grouped" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "variant_badges" jsonb DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_mission_items_family 
ON public.mission_items USING btree (family);
```

### Paso 4: Verificar cambios
```sql
-- Ver estructura después
\d mission_items

-- Buscar las nuevas columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mission_items'
AND column_name IN ('family', 'is_grouped', 'variant_badges')
ORDER BY ordinal_position;
```

**Resultado esperado**:
```
      column_name    |       data_type        | is_nullable | column_default
─────────────────────┼────────────────────────┼─────────────┼─────────────────
 family              | character varying      | t           | 
 is_grouped          | boolean                | t           | false
 variant_badges      | jsonb                  | t           | '[]'::jsonb
```

### Paso 5: Verificar índice
```sql
-- Ver índices de la tabla
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'mission_items';
```

Deberías ver `idx_mission_items_family` en la lista.

### Paso 6: Salir
```sql
\q
```

---

## 🧪 Pruebas Post-Migración

### Test 1: Insertar datos en nuevas columnas
```sql
-- Insertar un item de prueba con las nuevas columnas
INSERT INTO mission_items (
  mission_id, 
  title, 
  family, 
  is_grouped, 
  variant_badges, 
  benefits, 
  content_badges, 
  detail, 
  order_num
)
VALUES (
  '30000011-0000-0000-0000-000000000000',  -- mission_id existente
  'Producto Test',                          -- title
  'Vitaminas',                              -- family (NUEVO)
  true,                                     -- is_grouped (NUEVO)
  '["500ml", "1L"]'::jsonb,                -- variant_badges (NUEVO)
  'Beneficio 1; Beneficio 2',
  '["Etiqueta1"]',
  'Detalles del producto',
  99
);
```

### Test 2: Leer datos con nuevas columnas
```sql
SELECT 
  id,
  title,
  family,
  is_grouped,
  variant_badges,
  created_at
FROM mission_items
WHERE family = 'Vitaminas'
ORDER BY created_at DESC
LIMIT 5;
```

### Test 3: Búsqueda JSON
```sql
-- Buscar items que tengan "500ml" como variante
SELECT 
  id,
  title,
  variant_badges,
  family
FROM mission_items
WHERE variant_badges @> '"500ml"'::jsonb;
```

### Test 4: Limpiar (opcional)
```sql
-- Eliminar dato de prueba
DELETE FROM mission_items 
WHERE title = 'Producto Test';
```

---

## ⚠️ Solución de Problemas

### Problema 1: "Permission denied"
```
ERROR: permission denied for schema public
```

**Solución**: Verifica que tu usuario tiene permisos en la BD
```sql
-- Como superusuario/owner de la BD
GRANT ALL ON SCHEMA public TO tu_usuario;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tu_usuario;
```

### Problema 2: "Relation does not exist"
```
ERROR: relation "public.mission_items" does not exist
```

**Solución**: Verifica el nombre de la tabla y esquema
```sql
-- Ver todas las tablas
\dt public.*
```

### Problema 3: "Duplicate column"
```
ERROR: column "family" of relation "mission_items" already exists
```

**Solución**: Las columnas ya existen (es seguro, el script usa `IF NOT EXISTS`)

### Problema 4: Migración lenta
- Tabla muy grande (millones de filas)
- Servidor sobrecargado
- Bajo I/O de disco

**Solución**:
- Ejecutar en horario de bajo tráfico
- Monitorear con: `SELECT * FROM pg_stat_activity;`

---

## 🔄 Reversibilidad

Si necesitas revertir la migración (recuperar estado anterior):

```sql
-- OPCIÓN 1: Eliminar columnas individuales
ALTER TABLE "public"."mission_items" 
DROP COLUMN IF EXISTS "family",
DROP COLUMN IF EXISTS "is_grouped",
DROP COLUMN IF EXISTS "variant_badges";

-- OPCIÓN 2: Eliminar solo índice
DROP INDEX IF EXISTS idx_mission_items_family;
```

**Nota**: Los datos en las nuevas columnas se perderán si las eliminas.

---

## 📊 Monitoreo

### Durante la migración
```sql
-- Ver progreso
SELECT * FROM pg_stat_activity 
WHERE query LIKE '%mission_items%';
```

### Después de la migración
```sql
-- Ver tamaño de tabla
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'mission_items';

-- Ver tamaño de índices
SELECT 
  indexname, 
  pg_size_pretty(pg_relation_size(indexrelname)) AS size
FROM pg_indexes
WHERE tablename = 'mission_items';
```

---

## ✅ Checklist de Validación

- [ ] Migración ejecutada sin errores
- [ ] Nuevas columnas visibles en `\d mission_items`
- [ ] Índice `idx_mission_items_family` creado
- [ ] Query de Test 1 insertó datos correctamente
- [ ] Query de Test 2 retorna datos
- [ ] Query de Test 3 busca correctamente en JSON
- [ ] Importador funciona con datos nuevos
- [ ] No hay mensajes de error en logs

---

## 📝 Logs de Ejecución

### Guardar log de la migración
```bash
# Opción 1: Redirigir a archivo
psql -U usuario -d base_datos -f migration.sql > migration.log 2>&1

# Opción 2: En pgAdmin
# Admin → Server Logs → View Logs
```

### Ejemplo de log esperado
```
ALTER TABLE
CREATE INDEX
```

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración
2. ✅ Verificar columnas agregadas
3. ✅ Probar con datos de ejemplo
4. ✅ Probar importador con archivo Excel
5. ✅ Importar datos de producción (si corresponde)

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de PostgreSQL:
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

2. Verifica la conexión:
   ```bash
   psql -U usuario -d base_datos -c "SELECT version();"
   ```

3. Consulta la documentación:
   - [VERIFICACION_SCHEMA_IMPORTADOR.md](VERIFICACION_SCHEMA_IMPORTADOR.md)
   - [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📌 Resumen Rápido

**Archivo**: `database/migrations/add_missing_mission_items_columns.sql`

**Qué hace**:
- Agrega columna `family` (categoría del producto)
- Agrega columna `is_grouped` (si es grupo/paquete)
- Agrega columna `variant_badges` (variantes en JSON)
- Crea índice en `family` para búsquedas rápidas

**Tiempo**: < 1 segundo

**Seguridad**: ✅ Segura (IF NOT EXISTS, sin DROP)

**Reversibilidad**: ✅ Posible (ver sección Reversibilidad)

---

**Versión**: 1.0  
**Status**: ✅ Listo para ejecutar
