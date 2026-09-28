# Guía de Importación - Nivel Dorado

## Descripción
Se ha agregado un botón de **Importar** en la página de Nivel Dorado que permite cargar masivamente contenidos y preguntas desde un archivo Excel (.xlsx).

## Ubicación
- Página: `frontend-manager/src/app/(dashboard)/niveles/[levelId]/contenido-dorado/page.tsx`
- Componente: `frontend-manager/src/app/components/GoldenLevelImportModal.tsx`

## Formato del Archivo Excel

El archivo debe contener **2 pestañas** con los siguientes nombres exactos:

### 1️⃣ Pestaña: "Nivel Dorado - Contenidos"

Columnas requeridas:
| Columna | Tipo | Requerido | Descripción |
|---------|------|-----------|-------------|
| `Titulo` | Texto | ✅ Sí | Título del contenido (golden_level_items.title) |
| `Detalle` | Texto | ❌ No | Detalle/descripción del contenido (golden_level_items.detail) |

**Ejemplo:**
```
Titulo                          | Detalle
Introducción al tema           | Explicación general de conceptos básicos
Definición de términos         | Definiciones precisas de términos clave
Historia y contexto            | Antecedentes históricos y contexto relevante
```

### 2️⃣ Pestaña: "Nivel Dorado - Preguntas"

Columnas requeridas:
| Columna | Tipo | Requerido | Descripción |
|---------|------|-----------|-------------|
| `Pregunta` | Texto | ✅ Sí | Contenido de la pregunta |
| `Opción A` | Texto | ✅ Sí | Texto de la opción A |
| `Opción B` | Texto | ✅ Sí | Texto de la opción B |
| `Opción C` | Texto | ❌ No | Texto de la opción C (opcional) |
| `Opción D` | Texto | ❌ No | Texto de la opción D (opcional) |
| `Respuesta Correcta` | Texto | ✅ Sí | Letra de la opción correcta (A, B, C o D) |

**Ejemplo:**
```
Pregunta                          | Opción A      | Opción B      | Opción C | Opción D | Respuesta Correcta
¿Cuál es la capital?             | Madrid        | Barcelona     | Valencia | Sevilla  | A
¿Quién escribió el quijote?      | García Márquez| Cervantes     |          |          | B
```

## Características

✅ **Importación masiva**: Importa múltiples contenidos y preguntas en una sola operación
✅ **Validación de datos**: Valida que los campos requeridos estén presentes
✅ **Progreso en tiempo real**: Muestra un indicador de progreso durante la importación
✅ **Manejo de errores**: Reporta errores específicos por fila para facilitar la corrección
✅ **Actualización automática**: La lista se actualiza automáticamente al completar la importación
✅ **ID automático del nivel**: Obtiene el ID del nivel de la ruta actual (no necesita configuración manual)

## Restricciones y Validaciones

- ✅ El campo "Titulo" (contenidos) y "Pregunta" son **obligatorios**
- ✅ Se requieren al menos **2 opciones de respuesta** para las preguntas
- ✅ El campo "Respuesta Correcta" debe ser una letra válida: **A, B, C o D**
- ✅ No se pueden usar "Opción C" o "Opción D" sin usar "Opción B"
- ✅ El archivo debe estar en formato **.xlsx** (Excel)

## Proceso de Importación

1. Haz clic en el botón **"Importar"** en la pestaña correspondiente
2. Selecciona tu archivo Excel (.xlsx) con las dos pestañas requeridas
3. El modal mostrará un progreso detallado:
   - Leyendo archivo
   - Importando contenidos/preguntas
   - Creando opciones de respuesta
4. Al finalizar, verás un resumen con:
   - ✅ Cantidad de elementos creados
   - ⚠️ Errores encontrados (si los hay)
5. La lista se actualiza automáticamente con los nuevos datos

## Ejemplo de Estructura Completa

### Excel: "Nivel_Dorado_Importar.xlsx"

**Hoja 1: Nivel Dorado - Contenidos**
```
Titulo                           | Detalle
Fundamentos básicos             | Introducción a los conceptos fundamentales
Técnicas avanzadas              | Métodos y técnicas de nivel avanzado
Casos de estudio                | Análisis de casos reales y prácticos
```

**Hoja 2: Nivel Dorado - Preguntas**
```
Pregunta                                    | Opción A          | Opción B          | Opción C        | Opción D       | Respuesta Correcta
¿Cuál es el concepto principal?            | Concepto A        | Concepto B        | Concepto C      | Concepto D     | B
¿Qué método se recomienda usar?            | Método 1          | Método 2          |                 |                | A
¿En qué se diferencia la técnica avanzada? | Diferencia 1      | Diferencia 2      | Diferencia 3    | Diferencia 4   | C
```

## Manejo de Errores

Si durante la importación ocurren errores:
- Se mostrarán en el modal con el número de fila específica
- Los elementos válidos se crearán de todas formas
- Puedes corregir los errores y volver a intentar

**Errores comunes:**
- "Título vacío" → Asegúrate de que la columna "Titulo" no esté vacía
- "Se requieren al menos 2 opciones" → Verifica que haya al menos opciones A y B
- "Respuesta correcta debe ser A, B, C o D" → La respuesta debe ser una letra mayúscula válida

## Notas Técnicas

- El sistema genera automáticamente el `orderNum` (orden) basado en la posición en el archivo
- El `levelId` se obtiene de la ruta actual de la página
- Todas las opciones se asocian correctamente a sus preguntas
- La importación es transaccional: si hay errores críticos, se aborta la operación

---

**Última actualización:** 2024
**Componentes involucrados:**
- `GoldenLevelImportModal.tsx` - Modal de importación
- `page.tsx` - Página principal del Nivel Dorado
- API endpoints: `goldenLevelsApi` (items, questions, answers)
