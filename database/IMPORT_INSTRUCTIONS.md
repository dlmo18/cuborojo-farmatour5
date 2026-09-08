# Instrucciones para Cargar Datos de Prueba en Adminer

## 📋 Resumen de Datos Incluidos

Este script SQL (`test_data_complete.sql`) contiene **700+ registros** para pruebas completas:

### Estructura de Datos
- **4 Mundos**: Farmacología, Nutrición, Bienestar, Belleza
- **20 Niveles totales**:
  - 12 Niveles normales (3 por mundo)
  - 4 Niveles dorados (1 por mundo)
  - 4 Niveles finales (1 por mundo)
- **36 Misiones**: 3 por cada nivel normal
- **108 Mission Items**: 3 contenidos por misión (con HTML en detalle)
- **108 Preguntas normales**: 3 por misión
- **432 Opciones de respuesta**: 4 por pregunta
- **12 Golden Level Items**: 3 por nivel dorado
- **12 Golden Level Questions**: 3 por nivel dorado
- **36 Golden Level Answer Options**: 2-3 por pregunta
- **12 Final Level Questions**: 3 por nivel final (con videos Vimeo)
- **48 Final Level Answer Options**: 3-4 por pregunta (con imágenes)
- **10 Media Library entries**: Imágenes de productos

---

## 🚀 Pasos para Importar en Adminer

### Opción 1: Importar a través de la interfaz web de Adminer

1. **Acceder a Adminer**
   - URL: `http://localhost:8080` (o tu instancia local)
   - Usuario: postgres
   - Contraseña: tu_contraseña
   - Base de datos: cuborojo_farmatour5

2. **Navegar a Importación**
   - Lado izquierdo: Click en **"SQL command"** o **"Import"**
   - Copiar todo el contenido de `test_data_complete.sql`
   - Pegar en el área de texto SQL
   - Click en **"Execute"** o **"Run"**

3. **Verificar Ejecución**
   - Deberías ver: "OK" o el número de queries ejecutadas
   - Sin mensajes de error críticos

### Opción 2: Importar por línea de comando (Recomendado)

```bash
# Desde la carpeta del proyecto
cd /Users/davidmolina/Desktop/Proyectos/cuborojo-farmatour5

# Conectar a PostgreSQL e importar
psql -U postgres -d cuborojo_farmatour5 -f database/test_data_complete.sql

# Si pide contraseña:
# Ingresar contraseña de postgres
```

### Opción 3: Importar con pgAdmin

1. Abrir pgAdmin
2. Right-click en base de datos → Restore
3. Seleccionar `test_data_complete.sql`
4. Click en Restore

---

## ⚠️ Consideraciones Importantes

### Antes de Importar

- **Limpiar datos anteriores** (opcional):
  ```sql
  -- TRUNCATE sin eliminar tablas
  DELETE FROM answer_options CASCADE;
  DELETE FROM mission_items CASCADE;
  DELETE FROM questions CASCADE;
  DELETE FROM missions CASCADE;
  DELETE FROM final_level_questions CASCADE;
  DELETE FROM final_level_answer_options CASCADE;
  DELETE FROM golden_level_items CASCADE;
  DELETE FROM golden_level_questions CASCADE;
  DELETE FROM golden_level_answer_options CASCADE;
  DELETE FROM levels CASCADE;
  DELETE FROM worlds CASCADE;
  DELETE FROM media_library WHERE id >= '70000000-0000-0000-0000-000000000000';
  ```

- **Verificar estado del backend**: 
  - Las tablas deben existir en la base de datos
  - Las migraciones TypeORM deben estar aplicadas
  - Las enumeraciones (level_type, media_type, etc.) deben existir

### Después de Importar

1. **Verificar en Adminer/pgAdmin**:
   ```sql
   SELECT COUNT(*) FROM worlds;           -- Debe retornar: 4
   SELECT COUNT(*) FROM levels;           -- Debe retornar: 20
   SELECT COUNT(*) FROM missions;         -- Debe retornar: 36
   SELECT COUNT(*) FROM questions;        -- Debe retornar: 108
   SELECT COUNT(*) FROM mission_items;    -- Debe retornar: 108
   SELECT COUNT(*) FROM media_library;    -- Debe retornar: 10
   SELECT COUNT(*) FROM golden_level_questions;  -- Debe retornar: 12
   SELECT COUNT(*) FROM final_level_questions;   -- Debe retornar: 12
   ```

2. **Probar en el Frontend**:
   - Navegar a Mundos: Deberías ver 4 mundos con imágenes
   - Hacer click en un mundo → Ver 5 niveles (3 normales + 1 dorado + 1 final)
   - Hacer click en un nivel normal → Ver 3 misiones
   - Hacer click en una misión → Ver 3 contenidos y 3 preguntas
   - Hacer click en nivel dorado → Ver 3 items y 3 preguntas (evaluación)
   - Hacer click en nivel final → Ver 3 preguntas con videos

3. **Verificar APIs**:
   ```bash
   # Test de mundos
   curl http://localhost:3001/api/worlds
   
   # Test de un nivel específico
   curl http://localhost:3001/api/levels/20000001-0000-0000-0000-000000000000
   
   # Test de golden level
   curl http://localhost:3001/api/levels/20000004-0000-0000-0000-000000000000/golden
   
   # Test de final level
   curl http://localhost:3001/api/levels/20000005-0000-0000-0000-000000000000/final
   ```

---

## 📝 Estructura de UUIDs Utilizada

Para facilitar debugging y referencias:

### Mundos
```
10000001-0000-0000-0000-000000000000 = Farmacología
10000002-0000-0000-0000-000000000000 = Nutrición
10000003-0000-0000-0000-000000000000 = Bienestar
10000004-0000-0000-0000-000000000000 = Belleza
```

### Niveles (Mundo 1: 20000001-20000005)
```
20000001 = Nivel 1 Normal
20000002 = Nivel 2 Normal
20000003 = Nivel 3 Normal
20000004 = Nivel Dorado
20000005 = Nivel Final

20000006-10 = Mundo 2
20000011-15 = Mundo 3
20000016-20 = Mundo 4
```

### Misiones (Mundo 1: 30000001-30000009)
```
Mundo 1: 30000001-30000009
Mundo 2: 30000010-30000018
Mundo 3: 30000019-30000027
Mundo 4: 30000028-30000036
```

### Media Library
```
70000001-70000010 = Imágenes de productos
```

---

## 🛠️ Solución de Problemas

### Error: "relation already exists"
- Indica que ya hay datos
- Opción 1: Ejecutar DELETE statements antes
- Opción 2: Usar nueva base de datos de prueba

### Error: "column does not exist"
- Verificar que las migraciones estén aplicadas
- Revisar que las enumeraciones existan (level_type, media_type)
- Ejecutar backend migrations: `npm run typeorm migration:run`

### Error: "foreign key constraint"
- Los UUIDs de relaciones no coinciden
- Verificar que worlds, levels, missions se creen en orden
- El script ya sigue el orden correcto

### Datos no aparecen en el frontend
- Verificar que el backend esté corriendo: `npm run dev` en `/backend`
- Verificar NEXT_PUBLIC_API_URL en frontend
- Revisar consola del navegador (F12) para errores
- Verificar tokens de autenticación

---

## 📸 Verificación Visual

Después de importar, tu aplicación mostrará:

### Dashboard Admin
- **Mundos**: 4 mundos con imágenes
- **Niveles**: Ver estructura completa de cada mundo
- **Misiones**: 3 misiones por nivel normal
- **Contenidos**: 3 items con HTML detallado
- **Preguntas**: 3 preguntas por misión
- **Dorado**: Interfaz de evaluación funcional
- **Final**: 3 preguntas con videos Vimeo embebidos

### Datos Anidados
```
Mundos (4)
├── Nivel 1 (Normal)
│   ├── Misión 1
│   │   ├── Contenido 1, 2, 3
│   │   └── Pregunta 1, 2, 3 (c/u con 4 opciones)
│   ├── Misión 2
│   └── Misión 3
├── Nivel 2 (Normal)
├── Nivel 3 (Normal)
├── Nivel Dorado
│   ├── Item 1, 2, 3
│   └── Pregunta 1, 2, 3 (evaluación)
└── Nivel Final
    └── Pregunta 1, 2, 3 (con videos + respuestas con imágenes)
```

---

## 🎥 Videos Incluidos

Todas las preguntas de nivel final incluyen:
- **Video de Inicio**: https://vimeo.com/1115314235
- **Video de Cierre**: https://vimeo.com/1115314235

Estos pueden reemplazarse con otros URLs de Vimeo según necesidad.

---

## ✅ Checklist Post-Importación

- [ ] Datos importados sin errores
- [ ] Verificado count de registros en cada tabla
- [ ] Frontend muestra 4 mundos
- [ ] Nivel normal muestra 3 misiones
- [ ] Nivel dorado muestra interfaz de evaluación
- [ ] Nivel final muestra preguntas con videos
- [ ] API endpoints retornan datos correctamente
- [ ] Imágenes cargadas en media_library
- [ ] No hay errores en consola del navegador

---

## 📧 Notas Finales

- Los datos de prueba son genéricos y pueden editarse en el admin
- Las imágenes referenciadas están en `/docs/referencias/imagenes`
- Los videos son ejemplos de Vimeo (reemplazar con URLs reales según necesidad)
- Los contenidos están en HTML para permitir formato rich text
- Todas las preguntas tienen respuestas correctas marcadas

**¡Listo para hacer testing!** 🚀
