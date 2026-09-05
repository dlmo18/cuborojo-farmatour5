-- ============================================================
-- VERIFICACIÓN DE DATOS CARGADOS - Test Queries
-- ============================================================
-- Ejecutar estas queries después de importar test_data_complete.sql
-- para verificar que todos los datos se cargaron correctamente

-- ============================================================
-- 1. CONTEO GENERAL DE REGISTROS
-- ============================================================

-- Contar registros por tabla (copia y pega en Adminer)
SELECT 'Mundos' as tabla, COUNT(*) as cantidad FROM worlds
UNION ALL
SELECT 'Niveles', COUNT(*) FROM levels
UNION ALL
SELECT 'Misiones', COUNT(*) FROM missions
UNION ALL
SELECT 'Mission Items', COUNT(*) FROM mission_items
UNION ALL
SELECT 'Preguntas Normales', COUNT(*) FROM questions
UNION ALL
SELECT 'Opciones de Respuesta', COUNT(*) FROM answer_options
UNION ALL
SELECT 'Golden Level Items', COUNT(*) FROM golden_level_items
UNION ALL
SELECT 'Golden Level Questions', COUNT(*) FROM golden_level_questions
UNION ALL
SELECT 'Golden Level Answer Options', COUNT(*) FROM golden_level_answer_options
UNION ALL
SELECT 'Final Level Questions', COUNT(*) FROM final_level_questions
UNION ALL
SELECT 'Final Level Answer Options', COUNT(*) FROM final_level_answer_options
UNION ALL
SELECT 'Media Library', COUNT(*) FROM media_library
WHERE id >= '70000000-0000-0000-0000-000000000000';

-- Resultados esperados:
-- Mundos: 4
-- Niveles: 20
-- Misiones: 36
-- Mission Items: 108
-- Preguntas Normales: 108
-- Opciones de Respuesta: 432
-- Golden Level Items: 12
-- Golden Level Questions: 12
-- Golden Level Answer Options: 36
-- Final Level Questions: 12
-- Final Level Answer Options: 48
-- Media Library: 10

-- ============================================================
-- 2. VERIFICAR ESTRUCTURA JERÁRQUICA
-- ============================================================

-- Mundos con sus niveles
SELECT 
  w.name as Mundo,
  COUNT(l.id) as "Total Niveles",
  SUM(CASE WHEN l.level_type = 'normal' THEN 1 ELSE 0 END) as "Normales",
  SUM(CASE WHEN l.level_type = 'golden' THEN 1 ELSE 0 END) as "Dorados",
  SUM(CASE WHEN l.level_type = 'final' THEN 1 ELSE 0 END) as "Finales"
FROM worlds w
LEFT JOIN levels l ON w.id = l.world_id
GROUP BY w.id, w.name
ORDER BY w.order_num;

-- Resultado esperado:
-- Farmacología: 5 niveles (3 normal, 1 dorado, 1 final)
-- Nutrición: 5 niveles (3 normal, 1 dorado, 1 final)
-- Bienestar: 5 niveles (3 normal, 1 dorado, 1 final)
-- Belleza: 5 niveles (3 normal, 1 dorado, 1 final)

-- ============================================================
-- 3. VERIFICAR MISIONES Y CONTENIDOS
-- ============================================================

-- Contar misiones por nivel normal
SELECT 
  l.name as Nivel,
  COUNT(m.id) as "Total Misiones",
  SUM(COUNT(mi.id)) OVER (PARTITION BY l.id) as "Total Items",
  SUM(COUNT(q.id)) OVER (PARTITION BY l.id) as "Total Preguntas"
FROM levels l
LEFT JOIN missions m ON l.id = m.level_id
LEFT JOIN mission_items mi ON m.id = mi.mission_id
LEFT JOIN questions q ON m.id = q.mission_id
WHERE l.level_type = 'normal'
GROUP BY l.id, l.name
ORDER BY l.order_num;

-- Resultado esperado:
-- 12 niveles normales, cada uno con 3 misiones
-- Cada misión con 3 items y 3 preguntas

-- ============================================================
-- 4. VERIFICAR OPCIONES DE RESPUESTA
-- ============================================================

-- Contar opciones por pregunta
SELECT 
  q.id,
  q.content as Pregunta,
  COUNT(ao.id) as "Opciones de Respuesta",
  SUM(CASE WHEN ao.is_correct = true THEN 1 ELSE 0 END) as "Correctas"
FROM questions q
LEFT JOIN answer_options ao ON q.id = ao.question_id
GROUP BY q.id, q.content
LIMIT 20;

-- Cada pregunta debe tener 4 opciones, 1 correcta

-- ============================================================
-- 5. VERIFICAR DATOS DE NIVEL DORADO
-- ============================================================

-- Items dorados por nivel
SELECT 
  l.name as "Nivel Dorado",
  COUNT(DISTINCT gli.id) as "Total Items",
  COUNT(DISTINCT glq.id) as "Total Preguntas"
FROM levels l
LEFT JOIN golden_level_items gli ON l.id = gli.level_id
LEFT JOIN golden_level_questions glq ON l.id = glq.level_id
WHERE l.level_type = 'golden'
GROUP BY l.id, l.name
ORDER BY l.order_num;

-- Resultado esperado:
-- 4 niveles dorados
-- Cada uno con 3 items y 3 preguntas

-- ============================================================
-- 6. VERIFICAR DATOS DE NIVEL FINAL
-- ============================================================

-- Preguntas finales con opciones
SELECT 
  l.name as "Nivel Final",
  COUNT(DISTINCT flq.id) as "Total Preguntas",
  SUM(COUNT(DISTINCT flao.id)) OVER (PARTITION BY l.id) as "Total Opciones"
FROM levels l
LEFT JOIN final_level_questions flq ON l.id = flq.level_id
LEFT JOIN final_level_answer_options flao ON flq.id = flao.question_id
WHERE l.level_type = 'final'
GROUP BY l.id, l.name
ORDER BY l.order_num;

-- Resultado esperado:
-- 4 niveles finales
-- Cada uno con 3 preguntas
-- Cada pregunta con 3-4 opciones (12-16 opciones por nivel)

-- ============================================================
-- 7. VERIFICAR VIDEOS EN NIVEL FINAL
-- ============================================================

-- Verificar que los videos estén presentes
SELECT 
  id,
  content,
  start_video_url,
  end_video_url,
  correct_message,
  incorrect_message
FROM final_level_questions
LIMIT 3;

-- Resultado esperado:
-- Todos deben tener https://vimeo.com/1115314235
-- Todos deben tener mensajes correctos e incorrectos

-- ============================================================
-- 8. VERIFICAR MEDIA LIBRARY
-- ============================================================

-- Ver imágenes disponibles
SELECT 
  id,
  filename,
  file_url,
  media_type,
  mime_type,
  created_at
FROM media_library
WHERE id >= '70000000-0000-0000-0000-000000000000'
ORDER BY filename;

-- Resultado esperado:
-- 10 imágenes de productos

-- ============================================================
-- 9. VERIFICAR RELACIONES DE INTEGRIDAD
-- ============================================================

-- Preguntas sin misión asignada (ERROR)
SELECT * FROM questions WHERE mission_id IS NULL OR mission_id NOT IN (SELECT id FROM missions);

-- Answer options sin pregunta (ERROR)
SELECT * FROM answer_options WHERE question_id IS NULL OR question_id NOT IN (SELECT id FROM questions);

-- Mission items sin misión (ERROR)
SELECT * FROM mission_items WHERE mission_id IS NULL OR mission_id NOT IN (SELECT id FROM missions);

-- Golden items sin nivel (ERROR)
SELECT * FROM golden_level_items WHERE level_id IS NULL OR level_id NOT IN (SELECT id FROM levels);

-- Resultado esperado: 0 registros en todos

-- ============================================================
-- 10. QUERIES ÚTILES PARA TESTING
-- ============================================================

-- Obtener un mundo específico con toda su estructura
SELECT w.name as Mundo, l.name as Nivel, l.level_type as Tipo, 
       COUNT(DISTINCT m.id) as Misiones,
       COUNT(DISTINCT mi.id) as Items,
       COUNT(DISTINCT q.id) as Preguntas
FROM worlds w
LEFT JOIN levels l ON w.id = l.world_id
LEFT JOIN missions m ON l.id = m.level_id AND l.level_type = 'normal'
LEFT JOIN mission_items mi ON m.id = mi.mission_id
LEFT JOIN questions q ON m.id = q.mission_id
WHERE w.name = 'Farmacología'
GROUP BY w.id, w.name, l.id, l.name, l.level_type
ORDER BY l.order_num;

-- Obtener todas las preguntas de un nivel normal
SELECT m.name as Mision, q.content as Pregunta, 
       STRING_AGG(ao.text, ' | ') as Opciones,
       COUNT(CASE WHEN ao.is_correct = true THEN 1 END) as Correctas
FROM missions m
JOIN questions q ON m.id = q.mission_id
LEFT JOIN answer_options ao ON q.id = ao.question_id
WHERE m.level_id = '20000001-0000-0000-0000-000000000000'
GROUP BY m.id, m.name, q.id, q.content
ORDER BY m.order_num, q.order_num;

-- Obtener Golden Level completo
SELECT 
  gli.title as Item,
  glq.content as Pregunta,
  STRING_AGG(glao.text, ' | ') as Opciones
FROM golden_level_items gli
FULL OUTER JOIN golden_level_questions glq 
  ON gli.level_id = glq.level_id
FULL OUTER JOIN golden_level_answer_options glao 
  ON glq.id = glao.question_id
WHERE gli.level_id = '20000004-0000-0000-0000-000000000000'
ORDER BY COALESCE(gli.order_num, 0), COALESCE(glq.order_num, 0);

-- Obtener Final Level completo
SELECT 
  flq.content as Pregunta,
  flq.start_video_url as VideoInicio,
  flq.end_video_url as VideoCierre,
  STRING_AGG(flao.text, ' | ') as Opciones
FROM final_level_questions flq
LEFT JOIN final_level_answer_options flao 
  ON flq.id = flao.question_id
WHERE flq.level_id = '20000005-0000-0000-0000-000000000000'
GROUP BY flq.id, flq.content, flq.start_video_url, flq.end_video_url
ORDER BY flq.order_num;

-- ============================================================
-- 11. ESTADÍSTICAS FINALES
-- ============================================================

-- Resumen completo
SELECT 
  'Test Data Summary' as Estadistica,
  (SELECT COUNT(*) FROM worlds) as Mundos,
  (SELECT COUNT(*) FROM levels) as Niveles,
  (SELECT COUNT(*) FROM missions) as Misiones,
  (SELECT COUNT(*) FROM questions) as PreguntasNormales,
  (SELECT COUNT(*) FROM golden_level_questions) as PreguntasDoradas,
  (SELECT COUNT(*) FROM final_level_questions) as PreguntasFinales,
  (SELECT COUNT(*) FROM media_library WHERE id >= '70000000-0000-0000-0000-000000000000') as Imagenes;

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================

-- 1. Si algún COUNT no coincide, revisar:
--    - Que no haya errores en la importación
--    - Que las ForeignKeys estén correctas
--    - Que las UUIDs sean válidas

-- 2. Si hay registros huérfanos (sin padre):
--    - Significa integridad referencial rota
--    - Limpiar e re-importar

-- 3. Para debugging:
--    - Ver query plan: EXPLAIN ANALYZE [query]
--    - Ver índices: SELECT * FROM pg_indexes WHERE tablename='missions';
--    - Ver constraints: SELECT * FROM information_schema.table_constraints WHERE table_name='missions';

-- 4. Para performance testing:
--    - Ver tiempo de queries complejas
--    - Revisar que índices necesarios existan
--    - El backend crea índices automáticamente en migration
