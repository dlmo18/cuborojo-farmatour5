# ✅ CORRECCIÓN: Golden Level Items - Sin columna image_id

## Problema Encontrado

**Error:** `ERROR: column "image_id" does not exist`

**Causa:** El script SQL intentaba actualizar una columna `image_id` en la tabla `golden_level_items`, pero esta columna **no existe** en el schema.

---

## Estructura Real de golden_level_items

```sql
CREATE TABLE public.golden_level_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    detail text,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

**Columnas disponibles:** id, level_id, title, detail, order_num, created_at, updated_at

**Columnas que NO tiene:** image_id ❌

---

## Archivos Corregidos

### 1. **SCRIPT_MAESTRO_COMPLETO.sql**
- **Línea:** Fase 7 anterior
- **Cambio:** Se removió el UPDATE de `golden_level_items` con `image_id`
- **Razón:** La columna no existe en el schema

### 2. **UPDATE_VIDEOS_IMAGES.sql**
- **Líneas:** 63-80 (Parte 4)
- **Cambios:** 
  - Removido UPDATE de `golden_level_items`
  - Removida validación que contaba golden_level_items con image_id
- **Razón:** La columna no existe en el schema

### 3. **test_data_complete_enhanced.sql**
- **Estado:** ✅ Correcto (no intenta insertar image_id)
- **Cambio:** Ninguno necesario

---

## Tablas Que SÍ Tienen image_id

✅ **missions** - Tiene image_id  
✅ **mission_items** - Tiene image_id y thumbnail_id  
✅ **levels** - Tiene intro_video_id  
❌ **golden_level_items** - NO tiene image_id

---

## Scripts Actualizar

Los siguientes scripts están ahora **corregidos y listos**:

```bash
# Opción A (Recomendada)
cd /database
psql -f schema.sql
psql -f test_data_complete_enhanced.sql
psql -f UPDATE_VIDEOS_IMAGES.sql

# Opción B (Si datos existen)
cd /database
psql -f UPDATE_VIDEOS_IMAGES.sql

# Opción C (Todo en uno)
cd /database
psql -f SCRIPT_MAESTRO_COMPLETO.sql
```

---

## Validación Después de Ejecutar

```sql
-- Verifica que NO hay errores de columna
SELECT COUNT(*) FROM golden_level_items;

-- Verifica missions con imagen
SELECT COUNT(*) FROM missions WHERE image_id IS NOT NULL;

-- Verifica mission_items con imagen
SELECT COUNT(*) FROM mission_items WHERE image_id IS NOT NULL;

-- Verifica Vimeo URLs
SELECT COUNT(*) FROM final_level_questions 
WHERE start_video_url LIKE 'https://vimeo%';
```

---

## Resumen de Cambios

| Tabla | Antes | Ahora | Estado |
|-------|-------|-------|--------|
| golden_level_items | ❌ Intentaba update image_id | ✅ Removido | Fijo |
| missions | ✅ Update image_id | ✅ Update image_id | OK |
| mission_items | ✅ Update image_id | ✅ Update image_id | OK |
| levels | ✅ Update intro_video_id | ✅ Update intro_video_id | OK |

---

## ¿Qué Hacer Ahora?

1. **Ejecuta el script corregido:**
   ```bash
   cd /database
   psql -f UPDATE_VIDEOS_IMAGES.sql
   ```

2. **Valida con las queries anteriores**

3. **Si funciona:** ✅ Error resuelto

---

**Versión:** 3.1 (Corregida)  
**Fecha:** 2026-09-09  
**Estado:** ✅ LISTO PARA EJECUTAR
