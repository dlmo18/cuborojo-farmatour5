# Importador de Niveles - Documentación Completa

## Resumen

Se ha implementado un **Botón "Importador"** en la página de Niveles que permite importar datos masivos desde un archivo XLSX. El importador procesa automáticamente niveles, misiones e items de contenido de acuerdo con la estructura del Excel.

## Ubicación del Botón

- **Página**: `/mundos/[worldId]/niveles`
- **Ubicación**: Lado derecho del título "Niveles", junto al botón "Nuevo Nivel"
- **Icono**: Upload File (MdUploadFile)
- **Color**: Secundario (Color de acento/secondary)

## Flujo de Importación

### 1. **Abriendo el Modal**
Haz clic en el botón "Importador" para abrir el modal de importación.

### 2. **Seleccionar Archivo XLSX**
- Arrastra un archivo XLSX o haz clic para seleccionar uno
- El archivo debe contener una hoja llamada **"Niveles Normales - Contenidos"**

### 3. **Estructura del Excel Requerida**

La hoja "Niveles Normales - Contenidos" debe tener las siguientes columnas:

| Columna | Tipo | Descripción | Uso en BD |
|---------|------|-------------|----------|
| Mundo | Texto | Nombre del mundo (NO se usa - se toma del parámetro worldId) | - |
| Nivel | Texto | Nombre del nivel | `levels.name` |
| Misión | Texto | Nombre de la misión | `missions.name` |
| Familia de producto | Texto | Categoría del producto | `mission_items.family` (crear columna si no existe) |
| ¿Producto agrupado? | Texto/Bool | Si es Sí/true = agrupado | `mission_items.is_grouped` (crear columna si no existe) |
| Variantes / presentaciones | Texto | Separadas por `\|` | `mission_items.variant_badges` (crear columna si no existe) |
| Titular | Texto | Nombre del item | `mission_items.title` |
| Imagen del item (URL) | URL | URL de la imagen a descargar | `mission_items.image_id` (se descarga y sube automáticamente) |
| Beneficios | Texto | Descripción de beneficios | `mission_items.benefits` |
| Contenido (separador por ;) | Texto | Separadas por `;` | `mission_items.content_badges` |
| Detalle | Texto | Descripción detallada | `mission_items.detail` |

### 4. **Procesamiento de Datos**

#### Orden Numérico Automático
El importador calcula automáticamente el número de orden (`order_num`) para cada elemento:
- **Para Niveles**: Ordena alfabéticamente por `levels.name` y asigna posición
- **Para Misiones**: Ordena alfabéticamente por `missions.name` dentro de cada nivel
- **Para Items**: Ordena alfabéticamente por `mission_items.title` dentro de cada misión

Ejemplo:
```
Excel Input:
Nivel: "Nivel 2: Cuidado facial"
Nivel: "Nivel 1: Protección solar"

Procesado:
Nivel 1: Protección solar → order_num = 1
Nivel 2: Cuidado facial   → order_num = 2
```

#### Manejo de Imágenes
- Las imágenes se descargan automáticamente desde las URLs proporcionadas
- Se suben a la librería de medios del sistema
- Se obtiene el `image_id` y se asocia al item

#### Deduplicación
- Si un **nivel ya existe** con el mismo nombre, se reutiliza (se actualiza si es necesario)
- Si una **misión ya existe** con el mismo nombre en ese nivel, se reutiliza
- Si un **item ya existe** con el mismo título, se actualiza

### 5. **Modal de Progreso**

Durante la importación, se muestra un modal con:
- Barra de progreso visual
- Descripción de la etapa actual
- Porcentaje de avance
- Bloquea la interfaz hasta que termine

### 6. **Resumen de Resultados**

Al finalizar, el modal muestra:
- ✅ Mensaje de éxito o error
- 📊 Estadísticas:
  - Niveles creados
  - Niveles actualizados
  - Misiones creadas
  - Misiones actualizadas
  - Items creados
  - Items actualizados
  - Imágenes subidas
- ⚠️ Lista de errores (si los hay)

## Estructura de Carpetas

```
frontend-manager/
├── src/
│   └── app/
│       ├── components/
│       │   └── LevelsImportModal.tsx          ← NUEVO
│       └── (dashboard)/
│           └── mundos/
│               └── [worldId]/
│                   └── niveles/
│                       └── page.tsx           ← MODIFICADO
```

## Implementación Técnica

### Componente LevelsImportModal

**Ubicación**: `/frontend-manager/src/app/components/LevelsImportModal.tsx`

#### Props
```typescript
interface LevelsImportModalProps {
  isOpen: boolean;              // Si el modal está abierto
  onClose: () => void;          // Función al cerrar
  worldId: string;              // ID del mundo
  onSuccess: () => void;        // Callback después de importar
}
```

#### Estados
- `file`: Archivo XLSX seleccionado
- `importing`: Indicador de importación en curso
- `progress`: Objeto con datos de progreso
- `result`: Resultado final de la importación

#### Funciones Clave

**`parseExcel(file: File)`**
- Parsea el archivo XLSX
- Extrae datos de la hoja "Niveles Normales - Contenidos"
- Retorna un array de objetos

**`downloadImageAndUpload(imageUrl: string)`**
- Descarga imagen desde URL
- La sube a la API de medios
- Retorna el `imageId`

**`calculateOrderNum(items: string[])`**
- Calcula el número de orden automáticamente
- Ordena alfabéticamente
- Retorna array de posiciones

**`handleImport()`**
- Orquesta todo el proceso
- Maneja errores
- Actualiza el progreso
- Muestra resultados

### Cambios en la Página de Niveles

**Archivo**: `/frontend-manager/src/app/(dashboard)/mundos/[worldId]/niveles/page.tsx`

#### Cambios Realizados
1. ✅ Importado `LevelsImportModal` component
2. ✅ Importado icono `MdUploadFile` de react-icons
3. ✅ Agregado estado `showImportModal`
4. ✅ Agregado botón "Importador" en header
5. ✅ Agregado componente `LevelsImportModal` al final del render
6. ✅ Implementado callback `onSuccess` para recargar datos

## Uso del Importador

### Ejemplo de Archivo Excel Correcto

```
┌─────────┬──────────────────────────────┬─────────────────┬─────────────┬──────────────────┬──────────────────┬──────────────────────────┬──────────────────────┬──────────────────┬───────────────────────────┬─────────┐
│ Mundo   │ Nivel                        │ Misión          │ Familia     │ ¿Producto agr...? │ Variantes / pres. │ Titular                  │ Imagen del item (URL)│ Beneficios       │ Contenido (separador por ;) │ Detalle │
├─────────┼──────────────────────────────┼─────────────────┼─────────────┼──────────────────┼──────────────────┼──────────────────────────┼──────────────────────┼──────────────────┼───────────────────────────┼─────────┤
│ Mundo 1 │ Nivel 1: Protección solar    │ Misión 1: UV    │ Skincare    │ No                │ SPF 30|SPF 50     │ Producto A: Protector    │ https://url/img1.jpg │ Protege del sol   │ Natural;Dermatológico     │ Detalle1│
│ Mundo 1 │ Nivel 1: Protección solar    │ Misión 1: UV    │ Skincare    │ Sí                │ 100ml|200ml       │ Producto B: Serum        │ https://url/img2.jpg │ Hidrata           │ Orgánico;Vegano           │ Detalle2│
│ Mundo 1 │ Nivel 2: Cuidado facial      │ Misión 2: Rutina│ Skincare    │ No                │ Crema|Loción      │ Producto C: Cleanser     │ https://url/img3.jpg │ Limpia             │ Suave;Sin química        │ Detalle3│
└─────────┴──────────────────────────────┴─────────────────┴─────────────┴──────────────────┴──────────────────┴──────────────────────────┴──────────────────────┴──────────────────┴───────────────────────────┴─────────┘
```

## Fases Futuras

El importador está diseñado modularmente para extender fácilmente a otros tipos de importación:

1. **"Niveles Normales - Preguntas"** (Próxima)
   - Importará preguntas y opciones de respuesta para niveles normales

2. **"Niveles Dorados - Contenidos"**
   - Importará items de contenido para niveles dorados

3. **"Niveles Dorados - Preguntas"**
   - Importará preguntas para niveles dorados

4. **"Niveles Finales - Role Playing"**
   - Importará preguntas para niveles finales

### Estructura de Extensión

Cada tipo de importación requerirá:
1. Un switch en el modal para seleccionar el tipo
2. Una función de parseo específica
3. Lógica de procesamiento diferente según el tipo
4. Validaciones particulares

## Manejo de Errores

El importador maneja los siguientes errores:

- ❌ **Archivo vacío**: "El archivo Excel está vacío"
- ❌ **Hoja no encontrada**: "No se encontró la hoja 'Niveles Normales - Contenidos'"
- ❌ **Error descargando imagen**: Se registra en la lista de errores, continúa con los demás items
- ❌ **Error creando nivel/misión/item**: Se registra y continúa con el siguiente elemento
- ⚠️ **Errores parciales**: Se muestran en el resumen pero la importación continúa

## Consideraciones de Diseño

### Compatibilidad
- Usa `Array.from()` en lugar de spread operator para Set (compatibilidad con Node.js < 14)
- Usa `Object.entries()` en lugar de `.entries()` de Map
- Compatible con TypeScript sin necesidad de downlevelIteration

### Performance
- Procesa items en paralelo donde es posible (imágenes)
- Actualiza progreso frecuentemente para UI responsiva
- Limpia memoria después de cada operación

### UX
- Modal bloqueante durante importación (evita cambios accidentales)
- Progreso visual detallado
- Resumen claro con estadísticas
- Posibilidad de importar otro archivo sin cerrar modal

## Código Relacionado

### Líneas de Integración en page.tsx
- Línea 10: Import del componente
- Línea 11: Import del icono MdUploadFile
- Línea 35: Estado showImportModal
- Línea 347: Botón de importador en UI
- Línea 479-486: Componente LevelsImportModal

## Próximos Pasos Recomendados

1. **Extender el importador** para otros tipos de hojas
2. **Agregar validaciones** más robustas en Excel
3. **Implementar rollback** si hay errores críticos
4. **Cachear datos** de niveles/misiones para optimizar
5. **Agregar export** de niveles a Excel para ciclo completo

---

**Última actualización**: 2025-09-24
**Componente creado por**: GitHub Copilot
**Estado**: ✅ Listo para usar
