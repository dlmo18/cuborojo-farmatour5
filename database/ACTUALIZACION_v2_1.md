# ✅ Script Actualizado - Prevención de Conflictos de Clave Duplicada

## Problema Original
```
SQL Error [23505]: ERROR: duplicate key value violates unique constraint "idx_worlds_order"
Key (order_num)=(1) already exists.
```

Esto ocurría porque la base de datos ya contenía registros anteriores con los mismos `order_num`, y el script intentaba insertar duplicados.

---

## Solución Implementada

El archivo `test_data_complete.sql` ahora incluye una **FASE 1 de limpieza automática** que:

1. ✅ Elimina todos los datos de prueba anteriores (basado en UUIDs específicos)
2. ✅ Luego inserta los datos nuevos sin conflictos
3. ✅ Respeta el orden de dependencias (child before parent delete)

### Orden de Limpieza (Seguro)

```sql
-- 1. Eliminar respuestas de participantes
DELETE FROM participant_answers WHERE ...

-- 2. Eliminar preguntas y opciones
DELETE FROM questions WHERE ...
DELETE FROM answer_options WHERE ...

-- 3. Eliminar misiones y contenidos
DELETE FROM mission_items WHERE ...
DELETE FROM missions WHERE ...

-- 4. Eliminar niveles especiales
DELETE FROM golden_level_items WHERE ...
DELETE FROM golden_level_questions WHERE ...
DELETE FROM golden_level_answer_options WHERE ...
DELETE FROM final_level_questions WHERE ...
DELETE FROM final_level_answer_options WHERE ...

-- 5. Eliminar niveles y mundos
DELETE FROM levels WHERE ...
DELETE FROM worlds WHERE ...

-- 6. Eliminar media y grupos de test
DELETE FROM media_library WHERE id LIKE '7000%'
DELETE FROM groups WHERE id LIKE '8000%'
```

---

## ¿Por Qué es Seguro?

### ✅ Patrón de UUID Específico

Los UUIDs usados en datos de prueba siguen un patrón muy específico:
- **Mundos**: `1000000X-0000-0000-0000-000000000000` (1000xxxx)
- **Niveles**: `2000000X-0000-0000-0000-000000000000` (2000xxxx)
- **Misiones**: `3000000X-0000-0000-0000-000000000000` (3000xxxx)
- **Mission Items**: `4000000X-0000-0000-0000-000000000000` (4000xxxx)
- **Preguntas**: `5000000X-0000-0000-0000-000000000000` (5000xxxx)
- **Answer Options**: `6000000X-0000-0000-0000-000000000000` (6000xxxx)
- **Golden Items**: `9000000X-0000-0000-0000-000000000000` (9000xxxx)
- **Final Questions**: `9800000X-0000-0000-0000-000000000000` (98xxxxx)
- **Final Options**: `9900000X-0000-0000-0000-000000000000` (99xxxxx)
- **Media**: `7000000X-0000-0000-0000-000000000000` (7000xxxx)
- **Grupos**: `8000000X-0000-0000-0000-000000000000` (8000xxxx)

**NO conflictúa con datos reales** que típicamente usan UUIDs generados aleatoriamente.

### ✅ Respeta Integridad Referencial

Las deleteiones se hacen en orden correcto:
1. Primero las tablas dependientes (respuestas de participantes, opciones, preguntas)
2. Luego las tablas padre (misiones, niveles, mundos)
3. Finalmente tablas independientes (media, grupos)

### ✅ Limpio y Reutilizable

Cada vez que importes el script:
- Limpia cualquier dato de prueba anterior
- Inserta datos frescos y consistentes
- Sin conflictos, sin errores

---

## 🚀 Cómo Usar

### Opción 1: Línea de Comando (Recomendada)
```bash
psql -U cuborojo_user -d cuborojo_farmatour5 -f database/test_data_complete.sql
```

**Con contraseña interactiva:**
```bash
psql -U postgres -d cuborojo_farmatour5 -f database/test_data_complete.sql
# Cuando pida contraseña, ingresa: 1yojocctvnzs
```

### Opción 2: DBeaver
1. Abre DBeaver
2. Conecta a `cuborojo_farmatour5`
3. **Tools** → **SQL Editor** → **Open SQL Script**
4. Selecciona `/database/test_data_complete.sql`
5. Click **Execute** (▶️)

**Nota**: DBeaver ejecutará los DELETEs automáticamente sin preguntar.

### Opción 3: Adminer
1. Va a `http://localhost:8080`
2. Login a `cuborojo_farmatour5`
3. Click en **SQL command**
4. Pega el contenido completo de `test_data_complete.sql`
5. Click **Execute**

---

## ✅ Verificación Post-Importación

Después de ejecutar, verifica que todo fue correcto:

```sql
-- 1. Verificar que se limpió todo antes
-- (Estos queries deben retornar 0 si fue limpieza completa)
SELECT COUNT(*) as orphaned_worlds FROM worlds WHERE id LIKE '1000%';
SELECT COUNT(*) as orphaned_levels FROM levels WHERE id LIKE '2000%';

-- 2. Verificar que se insertó todo nuevo
SELECT COUNT(*) FROM worlds;
-- Esperado: 4

SELECT COUNT(*) FROM levels;
-- Esperado: 20

SELECT COUNT(*) FROM missions;
-- Esperado: 36

SELECT COUNT(*) FROM questions;
-- Esperado: 108

SELECT COUNT(*) FROM media_library WHERE id LIKE '7000%';
-- Esperado: 10

SELECT COUNT(*) FROM groups WHERE id LIKE '8000%';
-- Esperado: 1
```

---

## 🔄 ¿Qué Pasa si Tengo Datos Reales?

**¡No te preocupes!** Los datos reales NO serán afectados porque:

1. **UUIDs diferentes**: Los datos reales usan UUIDs generados aleatoriamente, no el patrón `1000xxxx`, `2000xxxx`, etc.
2. **Filtros específicos**: Los DELETEs usan `WHERE id LIKE '1000%'` que solo matchea test data
3. **Orden_num independiente**: Aunque haya conflicto de `order_num`, primero se borran los antiguos

### Si necesitas mantener datos de prueba anteriores:
Antes de ejecutar, haz backup:
```bash
pg_dump -U postgres -d cuborojo_farmatour5 > backup_before_test_data.sql
```

Luego si algo falla, restaura:
```bash
psql -U postgres -d cuborojo_farmatour5 < backup_before_test_data.sql
```

---

## 📋 Versiones del Script

| Versión | Archivo | Cambios |
|---------|---------|---------|
| 2.0 | `test_data_complete.sql` (antiguo) | ❌ Sin limpieza, causa conflictos |
| 2.1 | `test_data_complete.sql` (actual) | ✅ Con limpieza automática |
| 2.1 | `test_data_complete_v2.sql` | ✅ Backup de v2.1 |

---

## 🎯 Flujo de Importación Recomendado

```
1. Verificar BD está running
   ↓
2. (Opcional) Hacer backup
   ↓
3. Ejecutar: psql -U cuborojo_user -d cuborojo_farmatour5 -f database/test_data_complete.sql
   ↓
4. Esperar a que termine (2-5 segundos)
   ↓
5. Ver resultados: "INSERT 0 XXX" para cada statement
   ↓
6. Verificar conteos con queries de validación
   ↓
7. Probar en frontend ✅
```

---

## ⚠️ Si Aún Hay Errores

### Error: "ERROR: column does not exist"
- Verifica que estés usando la versión 2.1 del script
- Comprueba las columnas con: `\d media_library` (en psql)

### Error: "ERROR: duplicate key"
- Ejecuta los DELETEs manualmente primero
- O usa `TRUNCATE` (pero cuidado, borra todo)

### Error: "relation does not exist"
- Las tablas no existen en la BD
- Ejecuta el schema primero: `psql -U postgres -d cuborojo_farmatour5 -f database/schema.sql`

---

## 📞 Soporte Rápido

**Si hay problemas:**
1. Verifica que PostgreSQL está corriendo
2. Verifica credenciales en `.env`
3. Verifica que la BD existe y está accesible
4. Ejecuta primero: `psql -U postgres -d cuborojo_farmatour5 -c "SELECT 1"`
5. Si no funciona, restaura desde backup

---

**¡Archivo actualizado y listo!** 🎉

La próxima vez que ejecutes el script, automáticamente limpiará datos anteriores y evitará conflictos.
