# Instrucciones para Usar Datos de Prueba (test_data_complete.sql)

## Descripción General

El archivo `test_data_complete.sql` contiene datos de prueba completos para el sistema Farmatour5. Incluye:

- **4 Mundos**: Farmacología, Nutrición, Bienestar y Belleza
- **12 Niveles Normales**: 3 niveles por mundo (Fundamentos, Intermedio, Avanzado)
- **4 Niveles Dorados**: 1 por mundo (Evaluación Avanzada)
- **4 Niveles Finales**: 1 por mundo (Evaluación Final)

## Estructura de Datos

### Misiones y Contenidos
- **36 Misiones totales**: 3 por cada nivel normal
- **108 Contenidos de Misión**: 3 contenidos por misión
- **108 Preguntas de Misiones**: 3 preguntas por misión
- **432 Opciones de Respuesta**: 4 opciones por pregunta

### Niveles Dorados
- **12 Contenidos de Nivel Dorado**: 3 por cada nivel dorado
- **12 Preguntas de Nivel Dorado**: 3 por cada nivel dorado
- **48 Opciones de Nivel Dorado**: 4 por cada pregunta

### Niveles Finales
- **12 Preguntas de Nivel Final**: 3 por cada nivel final
- **48 Opciones de Nivel Final**: 4 por cada pregunta

## Cómo Usar

### Opción 1: Importar en PostgreSQL (Recomendado)

#### Windows/Linux:
```bash
psql -U postgres -d farmatour5 -f database/test_data_complete.sql
```

#### macOS:
```bash
psql -U postgres -d farmatour5 -f database/test_data_complete.sql
```

Si tienes contraseña configurada:
```bash
psql -U postgres -h localhost -d farmatour5 -f database/test_data_complete.sql
```

### Opción 2: Desde pgAdmin
1. Abre pgAdmin
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `farmatour5`
4. Abre Query Tool
5. Copia y pega el contenido de `test_data_complete.sql`
6. Ejecuta (F5 o botón Run)

### Opción 3: Desde DBeaver
1. Abre DBeaver
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `farmatour5`
4. Ve a File → Open SQL Script
5. Selecciona `test_data_complete.sql`
6. Ejecuta (Ctrl+Enter o botón Run)

## Contenido por Mundo

### 🔬 MUNDO 1: Farmacología
**Tema**: Medicamentos y su uso correcto

#### Nivel 1: Fundamentos (Misiones)
- **Misión 1**: Introducción a la Farmacología
- **Misión 2**: Clasificación de Medicamentos
- **Misión 3**: Rutas de Administración

#### Nivel 2-3: (Siguiendo patrón similar)
- Medicamentos Comunes
- Interacciones Medicamentosas
- Farmacología Avanzada

#### Nivel Dorado: Maestro Farmacéutico
- Farmacodinámica Avanzada
- Interacciones Complejas
- Efectos Adversos

#### Nivel Final: Prueba Definitiva
- Casos clínicos complejos
- Interacciones medicamentosas
- Farmacocinética práctica

### 🥗 MUNDO 2: Nutrición
**Tema**: Alimentación saludable y nutrientes

#### Nivel 1: Nutrientes Básicos
- **Misión 1**: Proteínas y Grasas
- **Misión 2**: Carbohidratos y Fibra
- **Misión 3**: Agua y Hidratación

#### Nivel Dorado: Experto Nutricional
- Nutrición Personalizada
- Suplementos y Complementos
- Mitos sobre Nutrición

#### Nivel Final: Nutrición Avanzada
- Dietas especializadas
- Impacto del estrés
- Nutrición integral

### 💪 MUNDO 3: Bienestar
**Tema**: Ejercicio, salud mental y equilibrio

#### Nivel 1: Actividad Física
- **Misión 1**: Beneficios del Ejercicio
- **Misión 2**: Tipos de Ejercicio
- **Misión 3**: Seguridad en Ejercicio

#### Nivel Dorado: Bienestar Integral
- Holismo en Bienestar
- Mindfulness y Meditación
- Conexión Mente-Cuerpo

#### Nivel Final: Vida Saludable
- Frecuencia de ejercicio
- Balance en bienestar
- Importancia del sueño

### 💄 MUNDO 4: Belleza
**Tema**: Cuidado de piel y cosmética

#### Nivel 1: Cuidado de Piel
- **Misión 1**: Tipos de Piel
- **Misión 2**: Rutina Básica
- **Misión 3**: Protección Solar

#### Nivel Dorado: Experto en Belleza
- Ingredientes Cosméticos
- Skincare Personalizado
- Belleza y Bienestar

#### Nivel Final: Arte de la Belleza
- Orden correcto de skincare
- Tiempo para resultados
- Mantenimiento de piel

## Características de los Datos

### Información Completa
Cada pregunta incluye:
- Contenido de la pregunta
- 4 opciones de respuesta
- 1 opción correcta marcada
- Detalles/explicaciones opcionales
- Orden de presentación

### IDs Predecibles
Los datos usan IDs en formato UUID predecible:
- Misiones: `30000XXX-0000-0000-0000-000000000000`
- Contenidos: `40000XXX-0000-0000-0000-000000000000`
- Preguntas: `50000XXX-0000-0000-0000-000000000000`
- Opciones: `60000XXX-0000-0000-0000-000000000000`
- Etc.

Esto facilita identificar y debuggear datos específicos.

## Notas Importantes

1. **Limpieza Automática**: El script comienza limpiando datos anteriores, por lo que es seguro ejecutarlo múltiples veces.

2. **Integridad Referencial**: Todos los datos respetan las relaciones de clave foránea.

3. **Timestamps**: Todos los timestamps se establecen a `NOW()`, reflejando la hora de ejecución.

4. **No Incluye Participantes**: Los datos de prueba no incluyen participantes, grupos o respuestas. Son datos maestros puros.

5. **Mundos Existentes**: Utiliza los mundos existentes en tu base de datos. Si has eliminado los mundos, primero restaura el schema.

## Validación

Después de importar, verifica con estas consultas:

```sql
-- Contar misiones
SELECT COUNT(*) as total_misiones FROM missions;
-- Esperado: 36

-- Contar contenidos
SELECT COUNT(*) as total_contenidos FROM mission_items;
-- Esperado: 108

-- Contar preguntas
SELECT COUNT(*) as total_preguntas FROM questions;
-- Esperado: 108

-- Contar opciones
SELECT COUNT(*) as total_opciones FROM answer_options;
-- Esperado: 432

-- Contar por nivel dorado
SELECT COUNT(*) as total_dorado FROM golden_level_questions;
-- Esperado: 12

-- Contar por nivel final
SELECT COUNT(*) as total_final FROM final_level_questions;
-- Esperado: 12

-- Verificar una misión completa
SELECT 
    m.name as mision,
    COUNT(DISTINCT mi.id) as contenidos,
    COUNT(DISTINCT q.id) as preguntas,
    COUNT(DISTINCT ao.id) as opciones
FROM missions m
LEFT JOIN mission_items mi ON m.id = mi.mission_id
LEFT JOIN questions q ON m.id = q.mission_id
LEFT JOIN answer_options ao ON q.id = ao.question_id
WHERE m.id = '30000001-0000-0000-0000-000000000000'
GROUP BY m.id, m.name;
-- Esperado: 1 misión, 3 contenidos, 3 preguntas, 12 opciones
```

## Solución de Problemas

### Error: "Relation not found"
- Asegúrate de que la base de datos existe y está correcta
- Restaura el schema: `psql -U postgres -d farmatour5 -f database/schema.sql`

### Error: "Column not found"
- Verifica que el schema está actualizado
- Compara con la versión del schema actual

### Datos duplicados
- Los mundos, niveles y otros datos se limpian automáticamente
- Pero si tienes datos de otros mundos, no se eliminarán

### Caracteres extraños
- Asegúrate de que la codificación es UTF-8
- En psql: `\encoding UTF8`

## Próximos Pasos

1. **Crear Participantes de Prueba**: 
```sql
INSERT INTO participants (id, full_name, dni, group_id, total_stars, is_active)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Test User', '12345678', NULL, 0, true);
```

2. **Crear Grupos de Prueba**:
```sql
INSERT INTO groups (id, name, description, is_active)
VALUES ('88888888-0000-0000-0000-000000000000', 'Test Group', 'Grupo de prueba', true);
```

3. **Crear Respuestas de Prueba**: Simular participantes respondiendo preguntas.

4. **Verificar Visualización**: Acceder a la aplicación y verificar que los datos se ven correctamente.

## Soporte

Si encuentras problemas:
1. Verifica el archivo `database/schema.sql` está actualizado
2. Consulta los logs de PostgreSQL
3. Ejecuta las consultas de validación
4. Revisa los errores en el output del import

---

**Última actualización**: Septiembre 2024
**Versión**: 1.0
**Compatibilidad**: PostgreSQL 12+
