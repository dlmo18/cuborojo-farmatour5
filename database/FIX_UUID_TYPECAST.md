# ✅ Corrección de Error UUID - PostgreSQL Type Cast

## Problema Identificado

```
SQL Error [42883]: ERROR: operator does not exist: uuid ~~ unknown
Hint: No operator matches the given name and argument types. 
You might need to add explicit type casts.
Position: 998
```

### Causa Raíz

En PostgreSQL, el operador `~~` es un alias de `LIKE` y **solo funciona con strings (text, varchar, etc.)**

El script intentaba usar `LIKE` directamente con columnas de tipo `UUID`:

```sql
-- ❌ INCORRECTO - No funciona
DELETE FROM worlds WHERE id LIKE '1000%'
-- Error: uuid no tiene operador ~~
```

---

## Solución Aplicada

Convertir el UUID a texto usando `::text` (cast de PostgreSQL):

```sql
-- ✅ CORRECTO - Funciona
DELETE FROM worlds WHERE id::text LIKE '1000%'
```

---

## Cambios Realizados

### Todas las líneas afectadas (18 en total)

| Tipo | Cambio | Antes | Después |
|------|--------|-------|---------|
| DELETE | Convertir UUID | `id LIKE` | `id::text LIKE` |

### Archivos Actualizados

1. **`test_data_complete.sql`** ✅
   - Línea 16-20: Queries anidadas con DELETE
   - Línea 23-27: DELETE golden/final levels
   - Línea 30: DELETE levels
   - Línea 33: DELETE worlds
   - Línea 36: DELETE media_library
   - Línea 39: DELETE groups

2. **`test_data_complete_v2.sql`** ✅
   - Mismos cambios (backup)

---

## Sintaxis PostgreSQL - Conversión de Tipos

### Métodos equivalentes:

```sql
-- Opción 1: Cast operator (más usado)
id::text LIKE '1000%'

-- Opción 2: CAST function
CAST(id AS text) LIKE '1000%'

-- Opción 3: text() function
text(id) LIKE '1000%'
```

**Recomendación**: Usar `::text` por ser más conciso y estándar en PostgreSQL.

---

## 🚀 Cómo Ejecutar Ahora

El script está corregido y listo:

### Opción 1: Línea de Comando
```bash
psql -U cuborojo_user -d cuborojo_farmatour5 -f database/test_data_complete.sql
```

### Opción 2: DBeaver
1. Abre DBeaver
2. Conecta a `cuborojo_farmatour5`
3. File → Open → `database/test_data_complete.sql`
4. Execute (▶️)

### Opción 3: Adminer
1. Va a `http://localhost:8080`
2. Login a `cuborojo_farmatour5`
3. SQL command → Pega el contenido
4. Execute

---

## ✅ Verificación Post-Ejecución

```sql
-- Verificar limpieza exitosa (debe retornar 0)
SELECT COUNT(*) FROM worlds WHERE id::text LIKE '1000%';

-- Verificar inserción exitosa (debe retornar 4)
SELECT COUNT(*) FROM worlds;

-- Verificar media (debe retornar 10)
SELECT COUNT(*) FROM media_library WHERE id::text LIKE '7000%';
```

---

## 📋 Comparativa de Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ERROR: operator does not exist: uuid ~~` | LIKE sin cast a UUID | Usar `id::text LIKE` |
| `ERROR: duplicate key value violates` | Datos anteriores | Script ya limpia automáticamente |
| `ERROR: column "filename" does not exist` | Nombres de columnas incorrectos | Ya corregido en v2.1 |
| `ERROR: relation does not exist` | Schema no existe | Ejecutar primero: `schema.sql` |

---

## 🎯 Flujo Completo de Importación

```
1. ✅ Verificar PostgreSQL está running
   └─ psql -U postgres -d cuborojo_farmatour5 -c "SELECT 1"

2. ✅ Ejecutar script corregido
   └─ psql -U cuborojo_user -d cuborojo_farmatour5 -f test_data_complete.sql

3. ✅ Esperar a que termine
   └─ Verá: INSERT 0 XXX repetido muchas veces

4. ✅ Validar resultados
   └─ SELECT COUNT(*) FROM worlds;  -- Debe retornar 4

5. ✅ Probar en Frontend
   └─ npm run dev en backend y frontend-manager
```

---

## 📞 Si Hay Más Errores

### Error: "relation does not exist"
```bash
# Primero ejecutar schema
psql -U postgres -d cuborojo_farmatour5 -f database/schema.sql

# Luego datos
psql -U cuborojo_user -d cuborojo_farmatour5 -f database/test_data_complete.sql
```

### Error: "password authentication failed"
```bash
# Usar credenciales correctas
DB_USERNAME=cuborojo_user
DB_PASSWORD=1yojocctvnzs
```

### Error: "connection refused"
```bash
# Verificar que PostgreSQL está running
brew services list
# O
pg_ctl -D /usr/local/var/postgres status
```

---

## 📚 Referencia de Type Casting en PostgreSQL

```sql
-- Convertir UUID a otros tipos
id::text          -- A string
id::varchar       -- A varchar
CAST(id AS text)  -- Sintaxis ANSI

-- Otros ejemplos útiles
created_at::date  -- Extrae solo la fecha
amount::integer   -- Convierte a int
price::numeric    -- Convierte a decimal
```

---

**¡Archivo corregido y listo para usar!** 🎉

La causa fue técnica pero la solución es simple: PostgreSQL requiere type casting explícito cuando se mezclan tipos diferentes en operadores.
