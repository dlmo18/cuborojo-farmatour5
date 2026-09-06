--
-- Test Data Complete SQL - Farmatour 5
-- Estructura: 4 Mundos × 5 Niveles (3 normales + 1 dorado + 1 final)
-- Por nivel normal: 3 misiones, 3 contenidos/misión, 3 preguntas/misión, 4 opciones/pregunta
-- Nivel dorado: 3 items, 3 preguntas, 4 opciones/pregunta
-- Nivel final: 3 preguntas, 4 opciones/pregunta
-- Usando gen_random_uuid() para UUIDs válidos
--

BEGIN;

-- ============================================================
-- 1. LIMPIAR DATOS DE PRUEBA ANTERIORES
-- ============================================================

DELETE FROM participant_final_level_answers;
DELETE FROM participant_final_level_progress;
DELETE FROM participant_golden_level_answers;
DELETE FROM participant_golden_level_progress;
DELETE FROM participant_level_progress;
DELETE FROM participant_answers;
DELETE FROM participant_mission_progress;
DELETE FROM final_level_answer_options;
DELETE FROM final_level_questions;
DELETE FROM golden_level_answer_options;
DELETE FROM golden_level_questions;
DELETE FROM golden_level_items;
DELETE FROM answer_options;
DELETE FROM questions;
DELETE FROM mission_items;
DELETE FROM missions;

-- ============================================================
-- 2. DATOS DE PRUEBA - MUNDOS Y NIVELES EXISTENTES
-- ============================================================
-- Mundos: 10000001 (Farmacología), 10000002 (Nutrición), 10000003 (Bienestar), 10000004 (Belleza)
-- Niveles por Mundo: 20000001-20000005 (5 niveles: 3 normales + 1 dorado + 1 final)

-- ============================================================
-- MUNDO 1: FARMACOLOGÍA
-- ============================================================

-- Misiones Nivel 1 (Fundamentos)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000001-0000-0000-0000-000000000000', 'Misión 1.1: Introducción a la Farmacología', 'Conceptos fundamentales de los fármacos', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000001-0000-0000-0000-000000000000', 'Misión 1.2: Clasificación de Medicamentos', 'Tipos y categorías de medicamentos', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000001-0000-0000-0000-000000000000', 'Misión 1.3: Rutas de Administración', 'Cómo se administran los fármacos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 2 (Mecanismos)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000002-0000-0000-0000-000000000000', 'Misión 2.1: Farmacocinética', 'Absorción, distribución, metabolismo y eliminación', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000002-0000-0000-0000-000000000000', 'Misión 2.2: Farmacodinámica', 'Efectos de los fármacos en el cuerpo', '7a4c8b9e-1f2a-4d5c-8e9b-3c1a5d7f2e0a', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000002-0000-0000-0000-000000000000', 'Misión 2.3: Interacciones Medicamentosas', 'Cómo interactúan diferentes fármacos', '2b5d3c1a-9e7f-4a8c-b3e1-6f4a2d5c9b8e', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 3 (Aplicaciones clínicas)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000003-0000-0000-0000-000000000000', 'Misión 3.1: Fármacos del Sistema Nervioso', 'Medicamentos que afectan al SNC', '5e2a8f7c-3b9d-4e1a-9c8f-2d5a7e4b1c6f', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000003-0000-0000-0000-000000000000', 'Misión 3.2: Fármacos Cardiovasculares', 'Medicamentos para el corazón y vasos', '8d1f5c9a-7e3b-4a2d-9f8c-1e6a5d2c8b7f', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000003-0000-0000-0000-000000000000', 'Misión 3.3: Fármacos Gastrointestinales', 'Medicamentos para el sistema digestivo', '3c7a1e9f-5b8d-4c6a-2f9e-7d4a1c5b8e3f', 3, 3, true, NOW(), NOW());

-- ============================================================
-- MUNDO 2: NUTRICIÓN
-- ============================================================

-- Misiones Nivel 6 (Fundamentos nutricionales)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000006-0000-0000-0000-000000000000', 'Misión 1.1: Macronutrientes', 'Proteínas, carbohidratos y grasas', 'a1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000006-0000-0000-0000-000000000000', 'Misión 1.2: Micronutrientes', 'Vitaminas y minerales esenciales', 'b2c3d4e5-f6a7-4b8c-9d0e-2f3a4b5c6d7e', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000006-0000-0000-0000-000000000000', 'Misión 1.3: Metabolismo Nutricional', 'Cómo el cuerpo procesa los alimentos', 'c3d4e5f6-a7b8-4c9d-0e1f-3a4b5c6d7e8f', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 7 (Nutrición aplicada)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000007-0000-0000-0000-000000000000', 'Misión 2.1: Dietas Especiales', 'Nutrición en diferentes condiciones', 'd4e5f6a7-b8c9-4d0e-1f2a-4b5c6d7e8f90', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000007-0000-0000-0000-000000000000', 'Misión 2.2: Alimentos Funcionales', 'Beneficios específicos de alimentos', 'e5f6a7b8-c9d0-4e1f-2a3b-5c6d7e8f90a1', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000007-0000-0000-0000-000000000000', 'Misión 2.3: Suplementación', 'Uso seguro de suplementos nutricionales', 'f6a7b8c9-d0e1-4f2a-3b4c-6d7e8f90a1b2', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 8 (Nutrición avanzada)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000008-0000-0000-0000-000000000000', 'Misión 3.1: Nutrición Deportiva', 'Nutrición para el rendimiento físico', 'a7b8c9d0-e1f2-4a3b-4c5d-7e8f90a1b2c3', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000008-0000-0000-0000-000000000000', 'Misión 3.2: Nutrición Clínica', 'Nutrición en condiciones patológicas', 'b8c9d0e1-f2a3-4b4c-5d6e-8f90a1b2c3d4', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000008-0000-0000-0000-000000000000', 'Misión 3.3: Patología Nutricional', 'Enfermedades relacionadas con nutrición', 'c9d0e1f2-a3b4-4c5d-6e7f-90a1b2c3d4e5', 3, 3, true, NOW(), NOW());

-- ============================================================
-- MUNDO 3: BIENESTAR
-- ============================================================

-- Misiones Nivel 11 (Bienestar físico)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000011-0000-0000-0000-000000000000', 'Misión 1.1: Actividad Física', 'Ejercicio y movimiento saludable', 'd0e1f2a3-b4c5-4d6e-7f80-91a2b3c4d5e6', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000011-0000-0000-0000-000000000000', 'Misión 1.2: Descanso y Sueño', 'La importancia del descanso', 'e1f2a3b4-c5d6-4e7f-8a91-a2b3c4d5e6f7', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000011-0000-0000-0000-000000000000', 'Misión 1.3: Higiene y Prevención', 'Hábitos de higiene personal', 'f2a3b4c5-d6e7-4f80-91a2-b3c4d5e6f7a8', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 12 (Bienestar mental)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000012-0000-0000-0000-000000000000', 'Misión 2.1: Salud Mental', 'Aspectos psicológicos del bienestar', 'a3b4c5d6-e7f8-4a91-2b3c-4d5e6f7a8b9c', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000012-0000-0000-0000-000000000000', 'Misión 2.2: Manejo del Estrés', 'Técnicas de relajación y control', 'b4c5d6e7-f8a9-4b2c-3d4e-5f6a7b8c9d0e', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000012-0000-0000-0000-000000000000', 'Misión 2.3: Inteligencia Emocional', 'Gestión de emociones', 'c5d6e7f8-a9b0-4c3d-4e5f-6a7b8c9d0e1f', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 13 (Bienestar integral)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000013-0000-0000-0000-000000000000', 'Misión 3.1: Estilos de Vida Saludables', 'Hábitos para una vida equilibrada', 'd6e7f8a9-b0c1-4d2e-5f6a-7b8c9d0e1f2a', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000013-0000-0000-0000-000000000000', 'Misión 3.2: Relaciones Sociales', 'Importancia de las conexiones', 'e7f8a9b0-c1d2-4e3f-6a7b-8c9d0e1f2a3b', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000013-0000-0000-0000-000000000000', 'Misión 3.3: Propósito y Significado', 'Sentido de vida y realización', 'f8a9b0c1-d2e3-4f4a-7b8c-9d0e1f2a3b4c', 3, 3, true, NOW(), NOW());

-- ============================================================
-- MUNDO 4: BELLEZA
-- ============================================================

-- Misiones Nivel 16 (Fundamentos de belleza)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000016-0000-0000-0000-000000000000', 'Misión 1.1: Dermología Básica', 'Estructura y función de la piel', 'a9b0c1d2-e3f4-4a5b-8c9d-0e1f2a3b4c5d', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000016-0000-0000-0000-000000000000', 'Misión 1.2: Tipos de Piel', 'Características y cuidados específicos', 'b0c1d2e3-f4a5-4b6c-9d0e-1f2a3b4c5d6e', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000016-0000-0000-0000-000000000000', 'Misión 1.3: Higiene Facial', 'Rutinas básicas de limpieza', 'c1d2e3f4-a5b6-4c7d-0e1f-2a3b4c5d6e7f', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 17 (Cosmetología)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000017-0000-0000-0000-000000000000', 'Misión 2.1: Cosméticos y Formulaciones', 'Tipos de cosméticos y sus ingredientes', 'd2e3f4a5-b6c7-4d8e-1f2a-3b4c5d6e7f8a', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000017-0000-0000-0000-000000000000', 'Misión 2.2: Tratamientos Estéticos', 'Procedimientos comunes en belleza', 'e3f4a5b6-c7d8-4e9f-2a3b-4c5d6e7f8a9b', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000017-0000-0000-0000-000000000000', 'Misión 2.3: Cabello y Cuidado', 'Estructura y cuidado del cabello', 'f4a5b6c7-d8e9-4f0a-3b4c-5d6e7f8a9b0c', 3, 3, true, NOW(), NOW());

-- Misiones Nivel 18 (Belleza avanzada)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), '20000018-0000-0000-0000-000000000000', 'Misión 3.1: Estética Facial Avanzada', 'Técnicas profesionales de belleza facial', 'a5b6c7d8-e9f0-4a1b-4c5d-6e7f8a9b0c1d', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000018-0000-0000-0000-000000000000', 'Misión 3.2: Maquillaje Profesional', 'Técnicas de maquillaje artístico', 'b6c7d8e9-f0a1-4b2c-5d6e-7f8a9b0c1d2e', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000018-0000-0000-0000-000000000000', 'Misión 3.3: Bienestar Integral', 'Belleza interna y externa', 'c7d8e9f0-a1b2-4c3d-6e7f-8a9b0c1d2e3f', 3, 3, true, NOW(), NOW());

-- ============================================================
-- 3. CONTENIDOS DE MISIONES (3 por misión)
-- ============================================================

-- Para simplificar, insertamos contenidos vinculando a todas las misiones
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Contenido 1 de ' || m.name,
  '4891df8a-7353-4399-8c14-c3a55e2a738f',
  '<p>Beneficios y conceptos clave</p>',
  '["Teoría", "Importante"]',
  '<p>Contenido detallado sobre ' || m.name || '. Este es el primer contenido asociado a esta misión.</p>',
  1,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Contenido 2 de ' || m.name,
  '81755fb5-9edf-4389-b060-a7f9b6ff681d',
  '<p>Información práctica y ejemplos</p>',
  '["Práctica", "Ejemplo"]',
  '<p>Segundo contenido detallado. Incluye casos prácticos y ejemplos aplicables.</p>',
  2,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Contenido 3 de ' || m.name,
  'cd938867-a5eb-48f5-a45b-deaed387db5f',
  '<p>Resumen y conclusiones</p>',
  '["Resumen", "Conclusión"]',
  '<p>Tercer contenido con resumen, conclusiones y referencias para profundizar.</p>',
  3,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

-- ============================================================
-- 4. PREGUNTAS Y OPCIONES (3 preguntas por misión, 4 opciones por pregunta)
-- ============================================================

-- Preguntas (3 por misión)
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Pregunta 1: ' || m.name,
  '4891df8a-7353-4399-8c14-c3a55e2a738f',
  1,
  1,
  true,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Pregunta 2: ' || m.name,
  '81755fb5-9edf-4389-b060-a7f9b6ff681d',
  2,
  1,
  true,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  m.id,
  'Pregunta 3: ' || m.name,
  'cd938867-a5eb-48f5-a45b-deaed387db5f',
  3,
  1,
  true,
  NOW(),
  NOW()
FROM missions m
WHERE m.level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                      '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                      '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                      '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000');

-- Opciones de respuesta (4 por pregunta)
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  q.id,
  'Respuesta correcta',
  '4891df8a-7353-4399-8c14-c3a55e2a738f',
  true,
  'Esta es la respuesta correcta',
  1,
  NOW()
FROM questions q
WHERE q.mission_id IN (SELECT id FROM missions WHERE level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                                                                    '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                                                                    '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                                                                    '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000'));

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  q.id,
  'Opción incorrecta 1',
  '81755fb5-9edf-4389-b060-a7f9b6ff681d',
  false,
  'Esta es una opción incorrecta plausible',
  2,
  NOW()
FROM questions q
WHERE q.mission_id IN (SELECT id FROM missions WHERE level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                                                                    '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                                                                    '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                                                                    '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000'));

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  q.id,
  'Opción incorrecta 2',
  'cd938867-a5eb-48f5-a45b-deaed387db5f',
  false,
  'Esta es otra opción incorrecta',
  3,
  NOW()
FROM questions q
WHERE q.mission_id IN (SELECT id FROM missions WHERE level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                                                                    '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                                                                    '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                                                                    '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000'));

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  q.id,
  'Opción incorrecta 3',
  'f9d1a6fd-2d98-40e3-a063-09121a1c9b20',
  false,
  'Esta es la tercera opción incorrecta',
  4,
  NOW()
FROM questions q
WHERE q.mission_id IN (SELECT id FROM missions WHERE level_id IN ('20000001-0000-0000-0000-000000000000', '20000002-0000-0000-0000-000000000000', '20000003-0000-0000-0000-000000000000',
                                                                    '20000006-0000-0000-0000-000000000000', '20000007-0000-0000-0000-000000000000', '20000008-0000-0000-0000-000000000000',
                                                                    '20000011-0000-0000-0000-000000000000', '20000012-0000-0000-0000-000000000000', '20000013-0000-0000-0000-000000000000',
                                                                    '20000016-0000-0000-0000-000000000000', '20000017-0000-0000-0000-000000000000', '20000018-0000-0000-0000-000000000000'));

-- ============================================================
-- 5. NIVELES DORADOS (Golden Levels) - 3 items, 3 preguntas, 4 opciones/pregunta
-- ============================================================

-- Items Golden Level (3 por mundo)
INSERT INTO golden_level_items (id, level_id, title, content, image_id, order_num, created_at, updated_at)
VALUES
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Item Dorado 1 - Farmacología', '<p>Contenido exclusivo de nivel dorado para Farmacología</p>', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, NOW(), NOW()),
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Item Dorado 2 - Farmacología', '<p>Segundo contenido dorado</p>', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, NOW(), NOW()),
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Item Dorado 3 - Farmacología', '<p>Tercer contenido dorado</p>', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Item Dorado 1 - Nutrición', '<p>Contenido exclusivo de nivel dorado para Nutrición</p>', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', 1, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Item Dorado 2 - Nutrición', '<p>Segundo contenido dorado</p>', '7a4c8b9e-1f2a-4d5c-8e9b-3c1a5d7f2e0a', 2, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Item Dorado 3 - Nutrición', '<p>Tercer contenido dorado</p>', '2b5d3c1a-9e7f-4a8c-b3e1-6f4a2d5c9b8e', 3, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Item Dorado 1 - Bienestar', '<p>Contenido exclusivo de nivel dorado para Bienestar</p>', '5e2a8f7c-3b9d-4e1a-9c8f-2d5a7e4b1c6f', 1, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Item Dorado 2 - Bienestar', '<p>Segundo contenido dorado</p>', '8d1f5c9a-7e3b-4a2d-9f8c-1e6a5d2c8b7f', 2, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Item Dorado 3 - Bienestar', '<p>Tercer contenido dorado</p>', '3c7a1e9f-5b8d-4c6a-2f9e-7d4a1c5b8e3f', 3, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Item Dorado 1 - Belleza', '<p>Contenido exclusivo de nivel dorado para Belleza</p>', 'a1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d', 1, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Item Dorado 2 - Belleza', '<p>Segundo contenido dorado</p>', 'b2c3d4e5-f6a7-4b8c-9d0e-2f3a4b5c6d7e', 2, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Item Dorado 3 - Belleza', '<p>Tercer contenido dorado</p>', 'c3d4e5f6-a7b8-4c9d-0e1f-3a4b5c6d7e8f', 3, NOW(), NOW());

-- Preguntas Golden Level (3 por mundo - 12 total)
INSERT INTO golden_level_questions (id, level_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Pregunta Dorada 1 - Farmacología', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Pregunta Dorada 2 - Farmacología', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000004-0000-0000-0000-000000000000', 'Pregunta Dorada 3 - Farmacología', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Pregunta Dorada 1 - Nutrición', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', 1, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Pregunta Dorada 2 - Nutrición', '7a4c8b9e-1f2a-4d5c-8e9b-3c1a5d7f2e0a', 2, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000009-0000-0000-0000-000000000000', 'Pregunta Dorada 3 - Nutrición', '2b5d3c1a-9e7f-4a8c-b3e1-6f4a2d5c9b8e', 3, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Pregunta Dorada 1 - Bienestar', '5e2a8f7c-3b9d-4e1a-9c8f-2d5a7e4b1c6f', 1, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Pregunta Dorada 2 - Bienestar', '8d1f5c9a-7e3b-4a2d-9f8c-1e6a5d2c8b7f', 2, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000014-0000-0000-0000-000000000000', 'Pregunta Dorada 3 - Bienestar', '3c7a1e9f-5b8d-4c6a-2f9e-7d4a1c5b8e3f', 3, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Pregunta Dorada 1 - Belleza', 'a1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d', 1, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Pregunta Dorada 2 - Belleza', 'b2c3d4e5-f6a7-4b8c-9d0e-2f3a4b5c6d7e', 2, 2, true, NOW(), NOW()),
(gen_random_uuid(), '20000019-0000-0000-0000-000000000000', 'Pregunta Dorada 3 - Belleza', 'c3d4e5f6-a7b8-4c9d-0e1f-3a4b5c6d7e8f', 3, 2, true, NOW(), NOW());

-- Opciones Golden Level (4 por pregunta - 48 total)
INSERT INTO golden_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  glq.id,
  'Respuesta Dorada Correcta',
  '4891df8a-7353-4399-8c14-c3a55e2a738f',
  true,
  'Respuesta correcta para nivel dorado',
  1,
  NOW()
FROM golden_level_questions glq;

INSERT INTO golden_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  glq.id,
  'Opción Dorada Incorrecta 1',
  '81755fb5-9edf-4389-b060-a7f9b6ff681d',
  false,
  'Opción incorrecta',
  2,
  NOW()
FROM golden_level_questions glq;

INSERT INTO golden_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  glq.id,
  'Opción Dorada Incorrecta 2',
  'cd938867-a5eb-48f5-a45b-deaed387db5f',
  false,
  'Opción incorrecta',
  3,
  NOW()
FROM golden_level_questions glq;

INSERT INTO golden_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  glq.id,
  'Opción Dorada Incorrecta 3',
  'f9d1a6fd-2d98-40e3-a063-09121a1c9b20',
  false,
  'Opción incorrecta',
  4,
  NOW()
FROM golden_level_questions glq;

-- ============================================================
-- 6. NIVELES FINALES (Final Levels) - 3 preguntas, 4 opciones/pregunta
-- ============================================================

-- Preguntas Final Level (3 por mundo - 12 total)
INSERT INTO final_level_questions (id, level_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), '20000005-0000-0000-0000-000000000000', 'Pregunta Final 1 - Farmacología', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000005-0000-0000-0000-000000000000', 'Pregunta Final 2 - Farmacología', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000005-0000-0000-0000-000000000000', 'Pregunta Final 3 - Farmacología', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000010-0000-0000-0000-000000000000', 'Pregunta Final 1 - Nutrición', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000010-0000-0000-0000-000000000000', 'Pregunta Final 2 - Nutrición', '7a4c8b9e-1f2a-4d5c-8e9b-3c1a5d7f2e0a', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000010-0000-0000-0000-000000000000', 'Pregunta Final 3 - Nutrición', '2b5d3c1a-9e7f-4a8c-b3e1-6f4a2d5c9b8e', 3, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000015-0000-0000-0000-000000000000', 'Pregunta Final 1 - Bienestar', '5e2a8f7c-3b9d-4e1a-9c8f-2d5a7e4b1c6f', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000015-0000-0000-0000-000000000000', 'Pregunta Final 2 - Bienestar', '8d1f5c9a-7e3b-4a2d-9f8c-1e6a5d2c8b7f', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000015-0000-0000-0000-000000000000', 'Pregunta Final 3 - Bienestar', '3c7a1e9f-5b8d-4c6a-2f9e-7d4a1c5b8e3f', 3, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000020-0000-0000-0000-000000000000', 'Pregunta Final 1 - Belleza', 'a1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d', 1, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000020-0000-0000-0000-000000000000', 'Pregunta Final 2 - Belleza', 'b2c3d4e5-f6a7-4b8c-9d0e-2f3a4b5c6d7e', 2, 3, true, NOW(), NOW()),
(gen_random_uuid(), '20000020-0000-0000-0000-000000000000', 'Pregunta Final 3 - Belleza', 'c3d4e5f6-a7b8-4c9d-0e1f-3a4b5c6d7e8f', 3, 3, true, NOW(), NOW());

-- Opciones Final Level (4 por pregunta - 48 total)
INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  flq.id,
  'Respuesta Final Correcta',
  '4891df8a-7353-4399-8c14-c3a55e2a738f',
  true,
  'Respuesta correcta para nivel final',
  1,
  NOW()
FROM final_level_questions flq;

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  flq.id,
  'Opción Final Incorrecta 1',
  '81755fb5-9edf-4389-b060-a7f9b6ff681d',
  false,
  'Opción incorrecta',
  2,
  NOW()
FROM final_level_questions flq;

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  flq.id,
  'Opción Final Incorrecta 2',
  'cd938867-a5eb-48f5-a45b-deaed387db5f',
  false,
  'Opción incorrecta',
  3,
  NOW()
FROM final_level_questions flq;

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at)
SELECT 
  gen_random_uuid(),
  flq.id,
  'Opción Final Incorrecta 3',
  'f9d1a6fd-2d98-40e3-a063-09121a1c9b20',
  false,
  'Opción incorrecta',
  4,
  NOW()
FROM final_level_questions flq;

COMMIT;
