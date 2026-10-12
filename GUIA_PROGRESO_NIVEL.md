# Guía: Sistema de Actualización de Progreso de Nivel

## 📋 Resumen de Cambios

Se ha implementado un sistema mejorado de actualización automática del `participant_level_progress` que ahora se refleja correctamente cada vez que se completa una misión dentro de un nivel.

## 🎯 Requisitos Implementados

### ✅ Finalización de Misión
- Una misión se considera **completa** cuando se han respondido **TODAS las preguntas** asociadas
- No importa si las respuestas son correctas o incorrectas
- Las estrellas ganadas se suman **SOLO** de las respuestas correctas

### ✅ Actualización de Progreso de Nivel
- **SIEMPRE** se actualiza el `participant_level_progress` cuando se completa una misión
- Las estrellas acumuladas = suma de todas las misiones completadas dentro del nivel
- `is_completed` = `false` mientras no estén completas todas las misiones del nivel
- `is_completed` = `true` SOLO cuando se completan todas las misiones del nivel
- `completed_at` se establece al momento de completar el nivel

### ✅ Finalización de Nivel
- Un nivel se considera **completo** cuando se han completado **TODAS sus misiones**
- No depende de la cantidad de estrellas obtenidas
- Al completarse, se valida automáticamente si el mundo está completo

## 🔄 Flujo de Ejecución

### Paso 1: Usuario Responde Pregunta
```
POST /progress/answer
├─ Payload: { questionId, answerId }
└─ Se guarda en: participant_answers
```

### Paso 2: Verificación de Progreso de Misión
```
Automático en updateMissionProgress()
├─ Contar preguntas totales de la misión
├─ Contar preguntas respondidas
├─ Si todas respondidas:
│  ├─ Marcar misión como is_completed = true
│  ├─ Sumar estrellas ganadas (solo correctas)
│  └─ Llamar a checkLevelCompletion()
└─ Guardar en: participant_mission_progress
```

### Paso 3: Actualización de Progreso de Nivel ⭐ **CAMBIO PRINCIPAL**
```
Automático en checkLevelCompletion()
├─ Contar misiones totales del nivel
├─ Contar misiones completadas
├─ Sumar estrellas de misiones completadas
├─ **SIEMPRE** actualizar participant_level_progress:
│  ├─ stars_earned = suma de estrellas
│  ├─ is_completed = (misiones_completadas === total)
│  └─ completed_at = NOW() si completado, NULL si no
└─ Si nivel completamente completo:
   ├─ Registrar en logs
   └─ Verificar completitud del mundo
```

## 🗂️ Tablas Afectadas

### `participant_mission_progress`
```sql
SELECT * FROM participant_mission_progress
WHERE participant_id = '{participantId}'
AND mission_id = '{missionId}'
-- Resultado: Una fila con stars_earned e is_completed
```

### `participant_level_progress`
```sql
SELECT * FROM participant_level_progress
WHERE participant_id = '{participantId}'
AND level_id = '{levelId}'
-- stars_earned: Suma acumulativa de todas las misiones completadas
-- is_completed: true SOLO cuando todas las misiones completadas
-- completed_at: NULL si no completado, NOW() si completado
```

### `participant_answers`
```sql
SELECT COUNT(*) FROM participant_answers
WHERE participant_id = '{participantId}'
AND question_id IN (
  SELECT id FROM questions
  WHERE mission_id = '{missionId}'
  AND is_active = TRUE
)
-- Debe coincidir con el número total de preguntas activas
```

## 🧪 Validación

### Test Case 1: Una Misión en Un Nivel (3 preguntas)
```
Inicio:
- participant_level_progress: { stars_earned: 0, is_completed: false }

Usuario responde pregunta 1 (correcta):
- participant_mission_progress: { is_completed: false }
- participant_level_progress: { stars_earned: 0, is_completed: false }

Usuario responde pregunta 2 (incorrecta):
- participant_mission_progress: { is_completed: false }
- participant_level_progress: { stars_earned: 1, is_completed: false }

Usuario responde pregunta 3 (correcta):
- participant_mission_progress: { is_completed: true, stars_earned: 2 }
- participant_level_progress: { stars_earned: 2, is_completed: true, completed_at: NOW() }
```

### Test Case 2: Múltiples Misiones en Un Nivel
```
Nivel con 2 misiones (cada una con 2 preguntas)

Misión 1 completa (2 estrellas):
- participant_level_progress: { stars_earned: 2, is_completed: false }

Misión 2 completa (1 estrella):
- participant_level_progress: { stars_earned: 3, is_completed: true, completed_at: NOW() }
```

## 📊 Consultas Útiles para Debugging

### Ver progreso completo de un participante
```sql
SELECT 
  l.name as "levelName",
  plp.stars_earned,
  plp.is_completed,
  plp.completed_at,
  COUNT(DISTINCT m.id) as "total_missions",
  SUM(CASE WHEN pmp.is_completed THEN 1 ELSE 0 END) as "completed_missions"
FROM participant_level_progress plp
JOIN levels l ON l.id = plp.level_id
LEFT JOIN missions m ON m.level_id = l.id AND m.is_active = TRUE
LEFT JOIN participant_mission_progress pmp ON pmp.participant_id = plp.participant_id 
  AND pmp.mission_id = m.id
WHERE plp.participant_id = '{participantId}'
GROUP BY l.id, plp.id
ORDER BY l.order_num;
```

### Ver si las estrellas están siendo contadas correctamente
```sql
SELECT 
  m.name as "missionName",
  pmp.is_completed,
  pmp.stars_earned,
  COUNT(DISTINCT q.id) as "total_questions",
  COUNT(DISTINCT pa.id) as "answered_questions",
  SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as "correct_answers"
FROM participant_mission_progress pmp
JOIN missions m ON m.id = pmp.mission_id
LEFT JOIN questions q ON q.mission_id = m.id AND q.is_active = TRUE
LEFT JOIN participant_answers pa ON pa.participant_id = pmp.participant_id 
  AND pa.question_id = q.id
WHERE pmp.participant_id = '{participantId}'
GROUP BY m.id, pmp.id
ORDER BY m.order_num;
```

## 🔧 Notas Técnicas

### Cambios en Backend
- **Archivo**: `/backend/src/modules/progress/progress.service.ts`
- **Método**: `checkLevelCompletion()`
- **Cambio**: Utiliza `INSERT ... ON CONFLICT DO UPDATE` para actualizar siempre

### Flujo del Frontend
- El frontend llama a `/progress/answer` cuando el usuario responde
- Cuando es la última pregunta, llama a `/progress/complete-mission`
- El backend se encarga automáticamente de actualizar progreso

### Sin Cambios Necesarios
- ✅ Endpoints de API: Ninguno nuevo requerido
- ✅ Schema de base de datos: Ninguno
- ✅ Frontend: El flujo actual es correcto

## 🚀 Próximos Pasos

1. **Compilar Backend**: Asegurar que TypeScript compila sin errores
2. **Ejecutar Tests**: Si existen tests del servicio ProgressService
3. **Validación Manual**: Completar una misión y verificar progreso en la BD
4. **Monitoreo**: Verificar logs de `checkLevelCompletion` en consola del servidor

## 📝 Ejemplos de Logs Esperados

```
[Mission Progress] Participant: abc-123, Mission: def-456, Stars: 2, Completed: true (3/3)
[Level Progress] Participant: abc-123, Level: ghi-789, Stars: 2, Completed: false (1/2)
[Level Progress] Participant: abc-123, Level: ghi-789, Stars: 3, Completed: true (2/2)
```

---

**Última actualización**: 2026-10-11
**Estado**: ✅ Implementado y Documentado
