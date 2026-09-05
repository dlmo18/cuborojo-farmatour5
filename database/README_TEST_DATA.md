# 📊 Datos de Prueba Completos - RESUMEN

## ✅ Archivos Generados

### 1. **`test_data_complete.sql`** - Script Principal
- **Ubicación**: `/database/test_data_complete.sql`
- **Tamaño**: ~50KB
- **Registros**: 700+ inserts
- **Contenido**: Estructura completa de datos de prueba

### 2. **`IMPORT_INSTRUCTIONS.md`** - Guía de Importación
- **Ubicación**: `/database/IMPORT_INSTRUCTIONS.md`
- **Contenido**: 
  - 3 métodos diferentes para importar
  - Checklist de verificación
  - Solución de problemas
  - Estructura de UUIDs

### 3. **`VERIFICATION_QUERIES.sql`** - Queries de Verificación
- **Ubicación**: `/database/VERIFICATION_QUERIES.sql`
- **Contenido**:
  - 11 secciones de verificación
  - Queries de integridad
  - Estadísticas finales

---

## 📦 Datos Cargados

### Estructura Jerárquica

```
┌─ 4 MUNDOS
│  ├─ Farmacología
│  ├─ Nutrición
│  ├─ Bienestar
│  └─ Belleza
│
└─ 20 NIVELES (5 por mundo)
   ├─ 12 Niveles Normales (3 x 4 mundos)
   │  └─ 36 Misiones (3 x 12 niveles)
   │     ├─ 108 Mission Items (3 x 36 misiones)
   │     ├─ 108 Preguntas (3 x 36 misiones)
   │     └─ 432 Answer Options (4 x 108 preguntas)
   │
   ├─ 4 Niveles Dorados (1 x 4 mundos)
   │  ├─ 12 Golden Items (3 x 4 niveles)
   │  ├─ 12 Golden Questions (3 x 4 niveles)
   │  └─ 36 Golden Answer Options (3 x 12 preguntas)
   │
   └─ 4 Niveles Finales (1 x 4 mundos)
      ├─ 12 Final Questions (3 x 4 niveles)
      └─ 48 Final Answer Options (4 x 12 preguntas)

+ 10 MEDIA LIBRARY ENTRIES (Imágenes)
+ 1 GRUPO DE PRUEBA
```

---

## 🎯 Especificaciones de Datos

### Mundos
| Mundo | Items | Descripción |
|-------|-------|-------------|
| Farmacología | 5 niveles, 9 misiones | Medicamentos y administración |
| Nutrición | 5 niveles, 9 misiones | Nutrientes y dietas |
| Bienestar | 5 niveles, 9 misiones | Ejercicio y salud mental |
| Belleza | 5 niveles, 9 misiones | Skincare y cosmética |

### Niveles por Mundo
```
Nivel 1: Normal (3 misiones c/u)
Nivel 2: Normal (3 misiones c/u)
Nivel 3: Normal (3 misiones c/u)
Nivel 4: Dorado (3 items + 3 preguntas de evaluación)
Nivel 5: Final (3 preguntas con videos + respuestas con imágenes)
```

### Preguntas y Respuestas
- **Preguntas Normales**: 108 (3 por misión)
- **Opciones por pregunta**: 4 (1 correcta, 3 incorrectas)
- **Golden Questions**: 12 (3 por nivel dorado, texto solo)
- **Golden Options**: 36 (2-3 por pregunta, texto solo)
- **Final Questions**: 12 (3 por nivel final, con videos)
- **Final Options**: 48 (3-4 por pregunta, con imágenes)

### Contenidos de Misión
- **108 Mission Items** (3 por misión)
- Contenido en **HTML** para rich text editor
- Incluyen títulos, detalles y beneficios

### Media Library
- **10 Imágenes** de productos/medicamentos
- URLs: `/media/[nombre].jpg`
- Tipos: JPEG, tamaños 96-112 KB

### Videos
- **Video URL**: `https://vimeo.com/1115314235`
- **Ubicación**: En inicio y cierre de preguntas finales
- **Fácilmente reemplazables** con otras URLs

---

## 🚀 Cómo Usar

### Paso 1: Importar Datos

**Opción A - Línea de Comando (Recomendado)**
```bash
cd /Users/davidmolina/Desktop/Proyectos/cuborojo-farmatour5
psql -U postgres -d cuborojo_farmatour5 -f database/test_data_complete.sql
```

**Opción B - Adminer Web**
1. Ir a `http://localhost:8080`
2. Login a `cuborojo_farmatour5`
3. SQL command → Pegar contenido de `test_data_complete.sql`
4. Execute

**Opción C - pgAdmin**
1. Database → Restore
2. Seleccionar `test_data_complete.sql`
3. Click Restore

### Paso 2: Verificar Importación

Ejecutar en Adminer o pgAdmin:
```sql
-- Copiar y ejecutar desde VERIFICATION_QUERIES.sql
SELECT 'Mundos' as tabla, COUNT(*) FROM worlds
UNION ALL SELECT 'Niveles', COUNT(*) FROM levels
UNION ALL SELECT 'Misiones', COUNT(*) FROM missions;
```

Resultados esperados:
- Mundos: **4**
- Niveles: **20**
- Misiones: **36**

### Paso 3: Probar en Frontend

1. Asegurar backend corriendo: `npm run dev` en `/backend`
2. Asegurar frontend corriendo: `npm run dev` en `/frontend-manager`
3. Navegar a Dashboard Admin
4. Verificar:
   - ✅ 4 mundos en Mundos/page.tsx
   - ✅ 5 niveles por mundo
   - ✅ 3 misiones por nivel normal
   - ✅ Interfaz dorada en nivel dorado
   - ✅ Videos en nivel final

---

## 🔍 Verificación Completa

### Queries de Verificación Rápida

Todas en `/database/VERIFICATION_QUERIES.sql`:

1. **Conteo General**
   ```sql
   -- Retorna 13 filas con conteos
   ```

2. **Estructura Jerárquica**
   ```sql
   -- Retorna 4 mundos con desglose de niveles
   ```

3. **Misiones y Contenidos**
   ```sql
   -- Retorna 12 niveles con 3 misiones c/u
   ```

4. **Integridad Referencial**
   ```sql
   -- Retorna 0 registros huérfanos
   ```

5. **Nivel Final**
   ```sql
   -- Retorna 4 niveles × 3 preguntas = 12 registros
   ```

---

## 📋 Checklist de Instalación

- [ ] Archivo `test_data_complete.sql` existe en `/database`
- [ ] Archivo `IMPORT_INSTRUCTIONS.md` existe en `/database`
- [ ] Archivo `VERIFICATION_QUERIES.sql` existe en `/database`
- [ ] Backend migrations aplicadas (`npm run typeorm migration:run`)
- [ ] PostgreSQL corriendo en el puerto correcto
- [ ] Adminer o psql disponible
- [ ] Datos importados sin errores
- [ ] Verificación SQL retorna conteos correctos
- [ ] Frontend carga mundos correctamente
- [ ] API endpoints responden con datos
- [ ] No hay errores en consola del navegador

---

## 🎬 Casos de Uso Para Testing

### 1. Testing de Interfaz Admin Normal
```
Ir a Mundos → Seleccionar un mundo → Ver 5 niveles
Seleccionar nivel normal → Ver 3 misiones
Seleccionar misión → Ver 3 contenidos + 3 preguntas
Hacer click en pregunta → Ver 4 opciones
```

### 2. Testing de Golden Level
```
Ir a Mundos → Seleccionar un mundo → Ver 5 niveles
Seleccionar nivel dorado (orden 4) → Ver 3 items + 3 preguntas
Las preguntas NO tienen opciones visibles (evaluación)
```

### 3. Testing de Final Level
```
Ir a Mundos → Seleccionar un mundo → Ver 5 niveles
Seleccionar nivel final (orden 5) → Ver 3 preguntas
Cada pregunta tiene video Vimeo embebido
Cada opción tiene imagen asociada
```

### 4. Testing de Grillas con Thumbnails
```
Ver misiones → Muestra thumbnail de imagen
Ver preguntas → Muestra thumbnail de imagen
Click en thumbnail → Abre preview modal
```

### 5. Testing de WYSIWYG
```
Mission Items → Detalles mostrados con HTML formateado
Golden Items → Detalles mostrados con HTML formateado
Mensajes correcto/incorrecto en Final → HTML formateado
```

---

## 🛠️ Notas Técnicas

### UUIDs Utilizados
- **Patrón consistente**: `XXXXX000-0000-0000-0000-000000000000`
- **Predecible**: Fácil de debugguear e identificar
- **No conflictivo**: No interfiere con datos existentes

### Imágenes
- **Rutas**: Todas usan patrón `/media/[filename].jpg`
- **Formato**: JPEGs reales de productos
- **Cargar en uploads/**: Backend mapea automáticamente

### HTML en Detalles
- **Format**: HTML limpio y simple
- **Renderable**: Compatible con rich text editors
- **Safe**: Sin JavaScript ni contenido malicioso

### Videos Vimeo
- **URL**: Todas https://vimeo.com/1115314235
- **Embebible**: iframe compatible
- **Reemplazable**: Cambiar URL en SQL si necesario

---

## 📞 Soporte

### Si los datos no aparecen
1. Revisar logs del backend: `npm run dev`
2. Revisar consola del navegador (F12)
3. Verificar conteos con VERIFICATION_QUERIES.sql
4. Confirmar NEXT_PUBLIC_API_URL correcto

### Si hay errores de integridad
1. Ejecutar DELETE statements antes de re-importar
2. Verificar que las tablas existan
3. Verificar que las enumeraciones estén definidas

### Si necesitas más/diferentes datos
1. Editar test_data_complete.sql
2. Cambiar textos, descripciones, videos
3. Ejecutar de nuevo

---

## 📊 Estadísticas Finales

| Concepto | Cantidad |
|----------|----------|
| Mundos | 4 |
| Niveles | 20 |
| Niveles Normales | 12 |
| Niveles Dorados | 4 |
| Niveles Finales | 4 |
| Misiones | 36 |
| Preguntas Normales | 108 |
| Preguntas Doradas | 12 |
| Preguntas Finales | 12 |
| Total Preguntas | 132 |
| Answer Options | 432 (normales) + 36 (doradas) + 48 (finales) |
| Mission Items | 108 |
| Golden Items | 12 |
| Media Library | 10 |
| Total Registros | **700+** |

---

**¡Listo para Testing!** 🎉

Los datos están organizados, verificables y listos para uso en ambiente de desarrollo.
