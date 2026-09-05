# 📊 Resumen de Datos de Prueba Generados

## Estadísticas Generales

```
Total de inserciones SQL:           100
Líneas del archivo:                 660
Tamaño aprox:                      ~25 KB
```

## Desglose por Componente

### 📚 Misiones (36 total)

```
┌─ MUNDO 1: FARMACOLOGÍA
│  ├─ Nivel 1: Fundamentos
│  │  ├─ Misión 1: Introducción a la Farmacología
│  │  ├─ Misión 2: Clasificación de Medicamentos  
│  │  └─ Misión 3: Rutas de Administración
│  ├─ Nivel 2: Medicamentos Comunes
│  └─ Nivel 3: Interacciones
│
├─ MUNDO 2: NUTRICIÓN
│  ├─ Nivel 1: Nutrientes Básicos
│  ├─ Nivel 2: Vitaminas y Minerales
│  └─ Nivel 3: Dietas Especiales
│
├─ MUNDO 3: BIENESTAR  
│  ├─ Nivel 1: Actividad Física
│  ├─ Nivel 2: Salud Mental
│  └─ Nivel 3: Equilibrio
│
└─ MUNDO 4: BELLEZA
   ├─ Nivel 1: Cuidado de Piel
   ├─ Nivel 2: Tratamientos
   └─ Nivel 3: Cosmética
```

### 📖 Contenidos de Misión (108 total)

- **3 contenidos por misión**
- **36 misiones × 3 = 108 contenidos**

Cada contenido incluye:
- Título descriptivo
- Beneficios principales
- Badges/categorías
- Detalle completo con información educativa

### ❓ Preguntas de Misión (108 total)

- **3 preguntas por misión**
- **36 misiones × 3 = 108 preguntas**

Cada pregunta tiene:
- Contenido de la pregunta
- **4 opciones de respuesta**
- 1 opción marcada como correcta
- Detalles explicativos

**Total de opciones**: 432 (108 × 4)

### 🥇 Niveles Dorados (4 total)

Uno por cada mundo:

| Mundo | Nivel Dorado | Preguntas | Contenidos |
|-------|-------------|-----------|-----------|
| Farmacología | Maestro Farmacéutico | 3 | 3 |
| Nutrición | Experto Nutricional | 3 | 3 |
| Bienestar | Bienestar Integral | 3 | 3 |
| Belleza | Experto en Belleza | 3 | 3 |

**Total**: 12 preguntas, 12 contenidos, 48 opciones de respuesta

### 🏆 Niveles Finales (4 total)

Uno por cada mundo (Prueba Definitiva):

| Mundo | Nivel Final | Preguntas | Opciones |
|-------|-----------|-----------|----------|
| Farmacología | Prueba Definitiva | 3 | 12 |
| Nutrición | Nutrición Avanzada | 3 | 12 |
| Bienestar | Vida Saludable | 3 | 12 |
| Belleza | Arte de la Belleza | 3 | 12 |

**Total**: 12 preguntas, 48 opciones de respuesta

## Distribución de Datos

### Por Tabla

```
Tabla                          Registros
──────────────────────────────────────
missions                       36
mission_items                  108
questions                      108
answer_options                 432
golden_level_items             12
golden_level_questions         12
golden_level_answer_options    48
final_level_questions          12
final_level_answer_options     48
──────────────────────────────────────
TOTAL                          816 registros
```

### Por Mundo

```
Mundo           Misiones  Contenidos  Preguntas  Opciones  Total
─────────────────────────────────────────────────────────────────
Farmacología    9         27          27         108       171
Nutrición       9         27          27         108       171
Bienestar       9         27          27         108       171
Belleza         9         27          27         108       171
─────────────────────────────────────────────────────────────────
Niveles Dorados 4         12          12         48        76
Niveles Finales -         -           12         48        60
─────────────────────────────────────────────────────────────────
TOTALES         36        108         108        432       816
```

## Cobertura de Contenido

### ✅ Completamente Poblados

- [x] Todos los 4 mundos
- [x] Todos los 12 niveles normales (3 × 4)
- [x] Todos los 4 niveles dorados
- [x] Todos los 4 niveles finales
- [x] Preguntas de misiones (108)
- [x] Preguntas de nivel dorado (12)
- [x] Preguntas de nivel final (12)
- [x] Opciones de respuesta (432)
- [x] Contenidos de misión (108)
- [x] Contenidos de nivel dorado (12)

### ⚠️ No Incluidos

- [ ] Participantes
- [ ] Grupos
- [ ] Respuestas de participantes
- [ ] Progreso de usuarios
- [ ] Medios/imágenes (referencias solo)
- [ ] Videos (referencias solo)

## Información de IDs

Los IDs usan UUIDs predecibles en formato:

```
Misiones:                       30000XXX-0000-0000-0000-000000000000
Contenidos de Misión:           40000XXX-0000-0000-0000-000000000000
Preguntas de Misión:            50000XXX-0000-0000-0000-000000000000
Opciones de Respuesta:          60000XXX-0000-0000-0000-000000000000
Contenidos Dorados:             70000XXX-0000-0000-0000-000000000000
Preguntas Doradas:              80000XXX-0000-0000-0000-000000000000
Opciones Doradas:               90000XXX-0000-0000-0000-000000000000
Preguntas Finales:             100000XXX-0000-0000-0000-0000-000000000000
Opciones Finales:              110000XXX-0000-0000-0000-0000-000000000000
```

Esto facilita:
- Identificar de qué tipo es cada registro
- Debuggear datos específicos
- Hacer referencia cruzada fácil
- Mantener trazabilidad

## Características Pedagógicas

### Niveles Progresivos

```
Nivel 1: Fundamentos
├─ Conceptos básicos
├─ Vocabulario esencial
└─ Comprensión introductoria

Nivel 2: Intermedio  
├─ Aplicaciones prácticas
├─ Comparativas
└─ Relaciones entre conceptos

Nivel 3: Avanzado
├─ Casos complejos
├─ Interconexiones
└─ Pensamiento crítico

Nivel Dorado: Evaluación
├─ Conocimiento integral
├─ Síntesis de temas
└─ Expertise esperado

Nivel Final: Consolidación
├─ Casos prácticos
├─ Aplicación compleja
└─ Dominio demostrativo
```

### Tipos de Preguntas

1. **Definición**: "¿Cuál es la definición correcta de...?"
2. **Identificación**: "¿Cuál/Dónde/Qué...?"
3. **Función**: "¿Cuál es la función de...?"
4. **Impacto**: "¿Cómo afecta/impacta...?"
5. **Clasificación**: "¿Cuál es la característica de...?"
6. **Aplicación**: "¿Cuándo se usa...?"

## Temas Cubiertos

### 🔬 Farmacología (36 preguntas)
- Concepto y definición
- Clasificación y tipos
- Rutas de administración  
- Farmacocinética y farmacodinámica
- Interacciones medicamentosas
- Efectos adversos

### 🥗 Nutrición (36 preguntas)
- Macronutrientes
- Micronutrientes
- Hidratación
- Dietas equilibradas
- Suplementos
- Mitos nutricionales

### 💪 Bienestar (36 preguntas)
- Ejercicio físico
- Salud mental
- Tipos de actividad
- Seguridad en ejercicio
- Mindfulness
- Conexión mente-cuerpo

### 💄 Belleza (36 preguntas)
- Tipos de piel
- Rutina de skincare
- Protección solar
- Ingredientes cosméticos
- Skincare personalizado
- Mantenimiento de belleza

## Estructura Técnica

### Integridad Referencial

```
Mundo (1)
  ├─→ Nivel (5 por mundo)
       ├─→ Misión (3 por nivel normal)
       │    ├─→ Mission Items (3 por misión)
       │    └─→ Question (3 por misión)
       │         └─→ Answer Options (4 por pregunta)
       │
       ├─→ Golden Level Items (3 por nivel dorado)
       ├─→ Golden Level Questions (3 por nivel dorado)
       │    └─→ Golden Level Answer Options (4 por pregunta)
       │
       └─→ Final Level Questions (3 por nivel final)
            └─→ Final Level Answer Options (4 por pregunta)
```

### Campos Incluidos

Cada registro tiene:
- `id`: UUID único
- `created_at`: NOW() (hora de inserción)
- `updated_at`: NOW() (hora de actualización)
- `is_active`: true (todos los datos están activos)
- `order_num`: Orden de presentación

## Casos de Uso

### ✅ Funciona Para

- [x] Pruebas de interfaz gráfica
- [x] Verificación de visualización de contenido
- [x] Testing de sistemas de preguntas
- [x] Validación de flujos de navegación
- [x] Demostración del sistema
- [x] Testing de búsqueda y filtrado
- [x] Validación de cálculo de puntos
- [x] Testing de accesibilidad
- [x] Análisis de rendimiento
- [x] Backup/restore de datos

### ❌ No Funciona Para

- [ ] Testing de progreso de usuarios
- [ ] Validación de estadísticas
- [ ] Testing de leaderboards
- [ ] Análisis de patrones de aprendizaje
- [ ] Testing de recomendaciones
- [ ] Evaluación de dificultad

## Próximos Pasos

Para un testing completo, considera:

1. **Agregar Participantes**:
```sql
INSERT INTO participants (full_name, dni, group_id, is_active)
VALUES ('Usuario Test', '12345678A', NULL, true);
```

2. **Agregar Respuestas**:
```sql
INSERT INTO participant_answers 
  (participant_id, question_id, answer_id, is_correct, stars_earned)
VALUES (?, ?, ?, true, 1);
```

3. **Registrar Progreso**:
```sql
INSERT INTO participant_mission_progress 
  (participant_id, mission_id, stars_earned, is_completed)
VALUES (?, ?, 3, true);
```

4. **Crear Grupos**:
```sql
INSERT INTO groups (name, description, is_active)
VALUES ('Grupo Test', 'Grupo de prueba', true);
```

## Validación del Importado

Ejecuta después de importar:

```sql
-- Verificar mundos
SELECT COUNT(*) as mundos FROM worlds;

-- Verificar misiones
SELECT COUNT(*) as misiones FROM missions;

-- Verificar contenidos
SELECT COUNT(*) as contenidos FROM mission_items;

-- Verificar preguntas
SELECT COUNT(*) as preguntas FROM questions;

-- Verificar opciones
SELECT COUNT(*) as opciones FROM answer_options;

-- Verificar integridad
SELECT 
  w.name as mundo,
  COUNT(DISTINCT l.id) as niveles,
  COUNT(DISTINCT m.id) as misiones,
  COUNT(DISTINCT mi.id) as contenidos
FROM worlds w
LEFT JOIN levels l ON w.id = l.world_id
LEFT JOIN missions m ON l.id = m.level_id
LEFT JOIN mission_items mi ON m.id = mi.mission_id
GROUP BY w.id, w.name
ORDER BY w.order_num;
```

---

**Generado**: Septiembre 2024
**Compatibilidad**: PostgreSQL 12+
**Tamaño Total**: ~25 KB
**Tiempo de Importación**: <5 segundos
