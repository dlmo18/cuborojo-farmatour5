# ✅ Corrección de Columnas - test_data_complete.sql

## Problema Identificado
El archivo `test_data_complete.sql` contenía nombres de columnas incorrectos para la tabla `media_library`, causando el error:
```
SQL Error [42703]: ERROR: column "filename" of relation "media_library" does not exist
```

---

## Cambios Realizados

### Tabla: media_library

#### ❌ ANTES (Incorrecto)
```sql
INSERT INTO media_library (id, filename, file_url, file_type, media_type, size_bytes, mime_type, created_at) VALUES
('70000000-0000-0000-0000-000000000001', 'abriflu.jpg', '/media/abriflu.jpg', 'jpg', 'image', 102400, 'image/jpeg', NOW()),
...
```

#### ✅ DESPUÉS (Correcto)
```sql
INSERT INTO media_library (id, name, type, url, file_size, mime_type, created_at) VALUES
('70000000-0000-0000-0000-000000000001', 'abriflu.jpg', 'image', '/media/abriflu.jpg', 102400, 'image/jpeg', NOW()),
...
```

### Mapeo de Columnas Corregidas

| Campo Anterior (❌) | Campo Correcto (✅) | Tipo | Descripción |
|-------------------|-------------------|------|-------------|
| `filename` | `name` | VARCHAR(255) | Nombre del archivo de media |
| `file_url` | `url` | VARCHAR(500) | URL del recurso |
| `file_type` | (Removido) | - | No necesario, uso `type` para enum |
| `media_type` | `type` | ENUM | Tipo de media (image, video, document) |
| `size_bytes` | `file_size` | BIGINT | Tamaño del archivo en bytes |

---

## Detalles de la Corrección

### Cambios en los VALUES

1. **Nombre a URL**: 
   - `filename` → `name` (primer parámetro después de id)
   
2. **Tipo de Enum**:
   - `'jpg'` → `'image'` (el tipo debe ser del enum `media_type`)
   
3. **Ordenamiento de columnas**:
   ```
   ANTES:  id, filename, file_url, file_type, media_type, size_bytes, mime_type, created_at
   AHORA:  id, name, type, url, file_size, mime_type, created_at
   ```

4. **Valores de ejemplo**:
   ```sql
   -- ANTES:
   ('70000000-0000-0000-0000-000000000001', 'abriflu.jpg', '/media/abriflu.jpg', 'jpg', 'image', 102400, 'image/jpeg', NOW())
   
   -- AHORA:
   ('70000000-0000-0000-0000-000000000001', 'abriflu.jpg', 'image', '/media/abriflu.jpg', 102400, 'image/jpeg', NOW())
   ```

---

## Validación Realizada

✅ Estructura real de `media_library` en schema.sql confirmada:
```sql
CREATE TABLE public.media_library (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,           -- ✓ Correcto
    type public.media_type NOT NULL,                -- ✓ Correcto (enum)
    url character varying(500) NOT NULL,            -- ✓ Correcto
    file_size bigint,                               -- ✓ Correcto
    mime_type character varying(100),               -- ✓ Correcto
    width integer,
    height integer,
    duration integer,
    tags text[],
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

---

## Estado del Archivo

📁 **Archivo Actualizado**: `/database/test_data_complete.sql`

### Secciones Verificadas
- ✅ Media Library (CORREGIDA)
- ✅ Grupos
- ✅ Mundos
- ✅ Niveles
- ✅ Misiones
- ✅ Mission Items
- ✅ Preguntas
- ✅ Answer Options
- ✅ Golden Levels
- ✅ Final Levels

---

## 🚀 Siguiente Paso: Importar Datos

Ahora el archivo SQL está listo. Importa nuevamente usando uno de estos métodos:

### Opción 1: Línea de Comando (Recomendada)
```bash
psql -U postgres -d cuborojo_farmatour5 -f database/test_data_complete.sql
```

### Opción 2: DBeaver
1. Abre DBeaver
2. Conecta a `cuborojo_farmatour5`
3. Tools → SQL Editor → Open SQL Script
4. Selecciona `/database/test_data_complete.sql`
5. Click Execute (▶️)

### Opción 3: Adminer
1. Va a `http://localhost:8080`
2. Login a `cuborojo_farmatour5`
3. Click en **SQL command**
4. Abre el archivo `/database/test_data_complete.sql`
5. Copia el contenido completo
6. Pega en el editor de Adminer
7. Click **Execute**

---

## ✅ Verificación Post-Importación

Después de importar, ejecuta estos queries para validar:

```sql
-- 1. Contar registros de media_library
SELECT COUNT(*) as total_media FROM media_library;
-- Esperado: 10

-- 2. Verificar estructura de media
SELECT id, name, type, url, file_size FROM media_library LIMIT 3;

-- 3. Contar mundos
SELECT COUNT(*) as total_mundos FROM worlds;
-- Esperado: 4

-- 4. Verificar jerarquía completa
SELECT 
    w.name as mundo,
    COUNT(DISTINCT l.id) as total_niveles,
    COUNT(DISTINCT m.id) as total_misiones
FROM worlds w
LEFT JOIN levels l ON l.world_id = w.id
LEFT JOIN missions m ON m.level_id = l.id
GROUP BY w.id, w.name
ORDER BY w.order_num;
-- Esperado: 4 mundos, cada uno con 5 niveles, y los normales con 3 misiones
```

---

## 📝 Notas Técnicas

### Por qué sucedió el error
- El archivo fue generado con una interpretación incorrecta de la estructura de `media_library`
- El schema actual usa nombres en snake_case: `file_size` no `size_bytes`, `name` no `filename`
- El enum `media_type` debe ser 'image', 'video', o 'document', no el tipo de archivo

### Archivos Afectados
- ✅ **Actualizado**: `/database/test_data_complete.sql`
- ✅ **No Necesitaban Cambios**:
  - `IMPORT_INSTRUCTIONS.md`
  - `VERIFICATION_QUERIES.sql`
  - `README_TEST_DATA.md`

---

**¡Archivo corregido y listo para usar!** 🎉

Si encuentras más errores al importar, verifica los nombres de columnas usando:
```sql
\d media_library        -- En psql
-- O en DBeaver: Database → Table → media_library → View Columns
```
