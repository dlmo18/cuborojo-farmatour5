--
-- Test Data Complete SQL
-- Datos de prueba para Farmatour 5
-- Generado automáticamente con:
-- - 3 misiones por nivel normal
-- - 3 contenidos por misión
-- - 3 preguntas por misión con 4 opciones cada una
-- - 3 contenidos por nivel dorado
-- - 3 preguntas por nivel dorado con 4 opciones cada una
-- - 3 preguntas por nivel final con 4 opciones cada una
--

BEGIN;

-- ============================================================
-- LIMPIAR DATOS DE PRUEBA ANTERIORES
-- ============================================================

DELETE FROM participant_final_level_answers WHERE question_id IN (SELECT id FROM final_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM participant_final_level_progress WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM participant_golden_level_answers WHERE question_id IN (SELECT id FROM golden_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM participant_golden_level_progress WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM participant_level_progress WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM participant_answers WHERE question_id IN (SELECT id FROM questions WHERE mission_id IN (SELECT id FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'))));
DELETE FROM participant_mission_progress WHERE mission_id IN (SELECT id FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM final_level_answer_options WHERE question_id IN (SELECT id FROM final_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM final_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM golden_level_answer_options WHERE question_id IN (SELECT id FROM golden_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM golden_level_questions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM golden_level_items WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));
DELETE FROM answer_options WHERE question_id IN (SELECT id FROM questions WHERE mission_id IN (SELECT id FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'))));
DELETE FROM questions WHERE mission_id IN (SELECT id FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM mission_items WHERE mission_id IN (SELECT id FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000')));
DELETE FROM missions WHERE level_id IN (SELECT id FROM levels WHERE world_id IN ('1000001-0000-0000-0000-000000000000', '1000002-0000-0000-0000-000000000000', '1000003-0000-0000-0000-000000000000', '1000004-0000-0000-0000-000000000000'));

-- ============================================================
-- MUNDO 1: FARMACOLOGÍA
-- ============================================================

-- NIVEL 1: Fundamentos (3 misiones)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
('30000001-0000-0000-0000-000000000000', '20000001-0000-0000-0000-000000000000', 'Misión 1: Introducción a la Farmacología', 'Conceptos fundamentales', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
('30000002-0000-0000-0000-000000000000', '20000001-0000-0000-0000-000000000000', 'Misión 2: Clasificación de Medicamentos', 'Tipos y categorías', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
('30000003-0000-0000-0000-000000000000', '20000001-0000-0000-0000-000000000000', 'Misión 3: Rutas de Administración', 'Cómo se administran los fármacos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW());

-- Contenidos para Misión 1
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000001-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', 'Historia de la Farmacología', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>La farmacología es la ciencia que estudia el origen, composición y efectos de los fármacos</p>', '["Historia", "Ciencia"]', '<p>Conoce cómo ha evolucionado la farmacología a lo largo de los siglos, desde los remedios naturales hasta los medicamentos sintéticos modernos.</p>', 1, NOW(), NOW()),
('40000002-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', 'Conceptos Básicos de Fármacos', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Un fármaco es cualquier sustancia química que produce efectos biológicos</p>', '["Concepto", "Definición"]', '<p>Los fármacos pueden ser de origen natural, sintético o semisintético. Cada uno tiene propiedades y usos específicos.</p>', 2, NOW(), NOW()),
('40000003-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', 'Propiedades Farmacocinéticas', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>La farmacocinética estudia qué hace el cuerpo con el fármaco</p>', '["Absorción", "Metabolismo"]', '<p>Incluye absorción, distribución, metabolismo y eliminación de un medicamento.</p>', 3, NOW(), NOW());

-- Preguntas para Misión 1
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000001-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', '¿Cuál es la definición correcta de farmacología?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000002-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', '¿Cuáles son los orígenes de los fármacos?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000003-0000-0000-0000-000000000000', '30000001-0000-0000-0000-000000000000', '¿Qué estudia la farmacocinética?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

-- Opciones para Pregunta 1 de Misión 1
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000001-0000-0000-0000-000000000000', '50000001-0000-0000-0000-000000000000', 'Ciencia que estudia el origen, composición y efectos de los fármacos', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Definición correcta', 1, NOW()),
('60000002-0000-0000-0000-000000000000', '50000001-0000-0000-0000-000000000000', 'Estudio de enfermedades infecciosas', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Esa es microbiología', 2, NOW()),
('60000003-0000-0000-0000-000000000000', '50000001-0000-0000-0000-000000000000', 'Ciencia de las plantas medicinales', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Esa es fitofarmacología', 3, NOW()),
('60000004-0000-0000-0000-000000000000', '50000001-0000-0000-0000-000000000000', 'Estudio del sistema nervioso', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Esa es neurología', 4, NOW());

-- Opciones para Pregunta 2 de Misión 1
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000005-0000-0000-0000-000000000000', '50000002-0000-0000-0000-000000000000', 'Natural, sintético y semisintético', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Estos son los tres orígenes principales', 1, NOW()),
('60000006-0000-0000-0000-000000000000', '50000002-0000-0000-0000-000000000000', 'Solo sintético', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Existen más orígenes', 2, NOW()),
('60000007-0000-0000-0000-000000000000', '50000002-0000-0000-0000-000000000000', 'Solo natural', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Existen más orígenes', 3, NOW()),
('60000008-0000-0000-0000-000000000000', '50000002-0000-0000-0000-000000000000', 'De laboratorio únicamente', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Existen más orígenes', 4, NOW());

-- Opciones para Pregunta 3 de Misión 1
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000009-0000-0000-0000-000000000000', '50000003-0000-0000-0000-000000000000', 'Qué hace el cuerpo con el fármaco', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Incluye absorción, metabolismo y eliminación', 1, NOW()),
('60000010-0000-0000-0000-000000000000', '50000003-0000-0000-0000-000000000000', 'Qué hace el fármaco en el cuerpo', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es farmacodinámica', 2, NOW()),
('60000011-0000-0000-0000-000000000000', '50000003-0000-0000-0000-000000000000', 'La historia de los medicamentos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Eso es historia de la medicina', 3, NOW()),
('60000012-0000-0000-0000-000000000000', '50000003-0000-0000-0000-000000000000', 'La clasificación de enfermedades', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Eso es nosología', 4, NOW());

-- Contenidos para Misión 2
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000004-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', 'Analgésicos y Antipiréticos', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Medicamentos que alivian el dolor y reducen la fiebre</p>', '["Dolor", "Fiebre"]', '<p>Son de los más utilizados. Incluyen paracetamol, ibuprofeno y aspirina.</p>', 1, NOW(), NOW()),
('40000005-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', 'Antibióticos', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Medicamentos que combaten infecciones bacterianas</p>', '["Infecciones", "Bacterias"]', '<p>Son fundamentales en la medicina moderna. Deben usarse responsablemente.</p>', 2, NOW(), NOW()),
('40000006-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', 'Antihipertensivos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Fármacos para controlar la presión arterial alta</p>', '["Presión", "Corazón"]', '<p>Esenciales para prevenir enfermedades cardiovasculares y accidentes cerebrovasculares.</p>', 3, NOW(), NOW());

-- Preguntas para Misión 2
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000004-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '¿Cuál es la función principal de los analgésicos?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000005-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '¿Contra qué combaten los antibióticos?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000006-0000-0000-0000-000000000000', '30000002-0000-0000-0000-000000000000', '¿Qué controlan los antihipertensivos?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

-- Opciones para Preguntas de Misión 2
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000013-0000-0000-0000-000000000000', '50000004-0000-0000-0000-000000000000', 'Aliviar el dolor', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Función principal', 1, NOW()),
('60000014-0000-0000-0000-000000000000', '50000004-0000-0000-0000-000000000000', 'Aumentar la presión arterial', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Esa no es su función', 2, NOW()),
('60000015-0000-0000-0000-000000000000', '50000004-0000-0000-0000-000000000000', 'Combatir infecciones', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Esa es función de antibióticos', 3, NOW()),
('60000016-0000-0000-0000-000000000000', '50000004-0000-0000-0000-000000000000', 'Mejorar la digestión', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Esa no es su función', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000017-0000-0000-0000-000000000000', '50000005-0000-0000-0000-000000000000', 'Infecciones bacterianas', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Acción correcta', 1, NOW()),
('60000018-0000-0000-0000-000000000000', '50000005-0000-0000-0000-000000000000', 'Virus', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Los antivirales combaten virus', 2, NOW()),
('60000019-0000-0000-0000-000000000000', '50000005-0000-0000-0000-000000000000', 'El dolor', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Los analgésicos combaten el dolor', 3, NOW()),
('60000020-0000-0000-0000-000000000000', '50000005-0000-0000-0000-000000000000', 'La fiebre', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Los antipiréticos controlan la fiebre', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000021-0000-0000-0000-000000000000', '50000006-0000-0000-0000-000000000000', 'La presión arterial alta', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Control correcto', 1, NOW()),
('60000022-0000-0000-0000-000000000000', '50000006-0000-0000-0000-000000000000', 'El colesterol', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Los estatinas controlan el colesterol', 2, NOW()),
('60000023-0000-0000-0000-000000000000', '50000006-0000-0000-0000-000000000000', 'La glucosa en sangre', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'La insulina controla la glucosa', 3, NOW()),
('60000024-0000-0000-0000-000000000000', '50000006-0000-0000-0000-000000000000', 'Las infecciones', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Los antibióticos combaten infecciones', 4, NOW());

-- Contenidos para Misión 3
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000007-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', 'Vía Oral', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>La más común y conveniente para el paciente</p>', '["Cómoda", "Común"]', '<p>Se administra por la boca. Incluye tabletas, cápsulas y líquidos.</p>', 1, NOW(), NOW()),
('40000008-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', 'Vía Intravenosa', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Administración directa en la sangre</p>', '["Rápida", "Precisa"]', '<p>Proporciona resultados inmediatos. Se usa en emergencias.</p>', 2, NOW(), NOW()),
('40000009-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', 'Vía Intramuscular y Subcutánea', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Inyecciones en músculos o bajo la piel</p>', '["Inyectable", "Efectiva"]', '<p>Usadas cuando se requiere absorción lenta y prolongada.</p>', 3, NOW(), NOW());

-- Preguntas para Misión 3
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000007-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', '¿Cuál es la vía más común de administración?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000008-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', '¿Cuándo se usa la vía intravenosa?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000009-0000-0000-0000-000000000000', '30000003-0000-0000-0000-000000000000', '¿Dónde se administra la inyección intramuscular?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

-- Opciones para Preguntas de Misión 3
INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000025-0000-0000-0000-000000000000', '50000007-0000-0000-0000-000000000000', 'Oral', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'La más cómoda y accesible', 1, NOW()),
('60000026-0000-0000-0000-000000000000', '50000007-0000-0000-0000-000000000000', 'Intravenosa', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es común en hospitales pero no la más común', 2, NOW()),
('60000027-0000-0000-0000-000000000000', '50000007-0000-0000-0000-000000000000', 'Tópica', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Menos común que la oral', 3, NOW()),
('60000028-0000-0000-0000-000000000000', '50000007-0000-0000-0000-000000000000', 'Rectal', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Menos común que la oral', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000029-0000-0000-0000-000000000000', '50000008-0000-0000-0000-000000000000', 'En emergencias y cuando se requiere efecto rápido', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Uso correcto', 1, NOW()),
('60000030-0000-0000-0000-000000000000', '50000008-0000-0000-0000-000000000000', 'Siempre que sea posible', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'No es conveniente siempre', 2, NOW()),
('60000031-0000-0000-0000-000000000000', '50000008-0000-0000-0000-000000000000', 'Para medicamentos con sabor desagradable', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Hay otras opciones', 3, NOW()),
('60000032-0000-0000-0000-000000000000', '50000008-0000-0000-0000-000000000000', 'Solo en cuidados paliativos', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Se usa en muchos contextos', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000033-0000-0000-0000-000000000000', '50000009-0000-0000-0000-000000000000', 'En el músculo', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Ubicación correcta', 1, NOW()),
('60000034-0000-0000-0000-000000000000', '50000009-0000-0000-0000-000000000000', 'En la vena', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Esa es intravenosa', 2, NOW()),
('60000035-0000-0000-0000-000000000000', '50000009-0000-0000-0000-000000000000', 'En la piel', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Esa es subcutánea', 3, NOW()),
('60000036-0000-0000-0000-000000000000', '50000009-0000-0000-0000-000000000000', 'En la boca', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Esa es oral', 4, NOW());

-- NIVEL DORADO: Maestro Farmacéutico (3 contenidos + 3 preguntas)
INSERT INTO golden_level_items (id, level_id, title, detail, order_num, created_at, updated_at) VALUES
('70000001-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', 'Principios Avanzados de Farmacodinámica', '<p>La farmacodinámica es lo que el fármaco hace al cuerpo. Estudia los mecanismos de acción y la relación entre concentración del fármaco y efecto biológico.</p>', 1, NOW(), NOW()),
('70000002-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', 'Interacciones Medicamentosas Complejas', '<p>Cuando dos o más medicamentos interactúan, pueden potenciar o inhibir sus efectos. Es fundamental conocer estas interacciones para evitar complicaciones.</p>', 2, NOW(), NOW()),
('70000003-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', 'Efectos Adversos y Contraindicaciones', '<p>Toda medicación tiene potencial para causar efectos no deseados. Conocer estos efectos es crucial para la seguridad del paciente.</p>', 3, NOW(), NOW());

INSERT INTO golden_level_questions (id, level_id, content, order_num, is_active, created_at, updated_at) VALUES
('80000001-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', '¿Cuál es la definición de farmacodinámica?', 1, true, NOW(), NOW()),
('80000002-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', '¿Qué sucede cuando dos fármacos tienen interacción sinérgica?', 2, true, NOW(), NOW()),
('80000003-0000-0000-0000-000000000000', '20000004-0000-0000-0000-000000000000', '¿Cuál es el enfoque principal para minimizar efectos adversos?', 3, true, NOW(), NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000001-0000-0000-0000-000000000000', '80000001-0000-0000-0000-000000000000', 'Qué hace el fármaco al cuerpo y sus mecanismos de acción', true, 1, NOW()),
('90000002-0000-0000-0000-000000000000', '80000001-0000-0000-0000-000000000000', 'Qué hace el cuerpo con el fármaco', false, 2, NOW()),
('90000003-0000-0000-0000-000000000000', '80000001-0000-0000-0000-000000000000', 'La historia del desarrollo de medicamentos', false, 3, NOW()),
('90000004-0000-0000-0000-000000000000', '80000001-0000-0000-0000-000000000000', 'Las reacciones alérgicas a medicamentos', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000005-0000-0000-0000-000000000000', '80000002-0000-0000-0000-000000000000', 'El efecto se potencia o intensifica', true, 1, NOW()),
('90000006-0000-0000-0000-000000000000', '80000002-0000-0000-0000-000000000000', 'Los efectos se neutralizan completamente', false, 2, NOW()),
('90000007-0000-0000-0000-000000000000', '80000002-0000-0000-0000-000000000000', 'No ocurre ningún cambio', false, 3, NOW()),
('90000008-0000-0000-0000-000000000000', '80000002-0000-0000-0000-000000000000', 'Solo afecta el sabor del medicamento', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000009-0000-0000-0000-000000000000', '80000003-0000-0000-0000-000000000000', 'Vigilancia continua y evaluación individual de cada paciente', true, 1, NOW()),
('90000010-0000-0000-0000-000000000000', '80000003-0000-0000-0000-000000000000', 'Usar solo medicamentos con nombre genérico', false, 2, NOW()),
('90000011-0000-0000-0000-000000000000', '80000003-0000-0000-0000-000000000000', 'Aumentar siempre las dosis prescritas', false, 3, NOW()),
('90000012-0000-0000-0000-000000000000', '80000003-0000-0000-0000-000000000000', 'Evitar completamente cualquier medicamento', false, 4, NOW());

-- NIVEL FINAL: Prueba Definitiva (3 preguntas con 4 opciones)
INSERT INTO final_level_questions (id, level_id, content, start_video_url, start_video_id, end_video_url, end_video_id, correct_message, incorrect_message, order_num, is_active, created_at, updated_at) VALUES
('10000001-0000-0000-0000-0000-000000000000', '20000005-0000-0000-0000-000000000000', '¿Cuál es el riesgo de tomar aspirina con warfarina?', NULL, NULL, NULL, NULL, '<p>¡Correcto! Estas medicaciones aumentan el riesgo de sangrado.</p>', '<p>No es correcto. Es importante conocer cómo estas dos drogas interactúan.</p>', 1, true, NOW(), NOW()),
('10000002-0000-0000-0000-0000-000000000000', '20000005-0000-0000-0000-000000000000', '¿Cuál es el proceso farmacocinético más importante en el hígado?', NULL, NULL, NULL, NULL, '<p>¡Exacto! El metabolismo es fundamental para la eliminación.</p>', '<p>Incorrecto. El hígado es responsable del metabolismo de la mayoría de los fármacos.</p>', 2, true, NOW(), NOW()),
('10000003-0000-0000-0000-0000-000000000000', '20000005-0000-0000-0000-000000000000', '¿Qué es la biodisponibilidad?', NULL, NULL, NULL, NULL, '<p>¡Correcto! La biodisponibilidad es crucial para la eficacia.</p>', '<p>Incorrecto. Se refiere a la cantidad que alcanza la circulación sistémica.</p>', 3, true, NOW(), NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000001-0000-0000-0000-0000-000000000000', '10000001-0000-0000-0000-0000-000000000000', 'Aumento del riesgo de sangrado', NULL, true, 1, NOW()),
('11000002-0000-0000-0000-0000-000000000000', '10000001-0000-0000-0000-0000-000000000000', 'Mejora sin riesgo', NULL, false, 2, NOW()),
('11000003-0000-0000-0000-0000-000000000000', '10000001-0000-0000-0000-0000-000000000000', 'Neutralización total', NULL, false, 3, NOW()),
('11000004-0000-0000-0000-0000-000000000000', '10000001-0000-0000-0000-0000-000000000000', 'No hay interacción', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000005-0000-0000-0000-0000-000000000000', '10000002-0000-0000-0000-0000-000000000000', 'Metabolismo y destoxificación', NULL, true, 1, NOW()),
('11000006-0000-0000-0000-0000-000000000000', '10000002-0000-0000-0000-0000-000000000000', 'Absorción de nutrientes', NULL, false, 2, NOW()),
('11000007-0000-0000-0000-0000-000000000000', '10000002-0000-0000-0000-0000-000000000000', 'Producción de anticuerpos', NULL, false, 3, NOW()),
('11000008-0000-0000-0000-0000-000000000000', '10000002-0000-0000-0000-0000-000000000000', 'Regulación de presión arterial', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000009-0000-0000-0000-0000-000000000000', '10000003-0000-0000-0000-0000-000000000000', 'Cantidad que alcanza la circulación sistémica', NULL, true, 1, NOW()),
('11000010-0000-0000-0000-0000-000000000000', '10000003-0000-0000-0000-0000-000000000000', 'Tiempo que tarda en actuar', NULL, false, 2, NOW()),
('11000011-0000-0000-0000-0000-000000000000', '10000003-0000-0000-0000-0000-000000000000', 'Costo total del tratamiento', NULL, false, 3, NOW()),
('11000012-0000-0000-0000-0000-000000000000', '10000003-0000-0000-0000-0000-000000000000', 'Duración en horas', NULL, false, 4, NOW());

-- Nota: Se pueden agregar datos similares para los Mundos 2, 3 y 4 (Nutrición, Bienestar, Belleza)
-- siguiendo la misma estructura. Por ahora, se proporciona el Mundo 1 completo como referencia.

COMMIT;

-- ============================================================
-- MUNDO 2: NUTRICIÓN
-- ============================================================

-- NIVEL 6: Nutrientes Básicos (3 misiones)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
('30000011-0000-0000-0000-000000000000', '20000006-0000-0000-0000-000000000000', 'Misión 1: Proteínas y Grasas', 'Macronutrientes esenciales', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
('30000012-0000-0000-0000-000000000000', '20000006-0000-0000-0000-000000000000', 'Misión 2: Carbohidratos y Fibra', 'Energía y digestión', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
('30000013-0000-0000-0000-000000000000', '20000006-0000-0000-0000-000000000000', 'Misión 3: Agua y Hidratación', 'Vital para el cuerpo', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW());

-- Contenidos Misión 1 Nivel 6
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000011-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', 'Proteínas Completas', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Proteínas con todos los aminoácidos esenciales</p>', '["Músculo", "Huesos"]', '<p>Encontradas en huevos, carnes, lácteos y legumbres. Esenciales para la construcción y reparación de tejidos.</p>', 1, NOW(), NOW()),
('40000012-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', 'Grasas Saludables', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Grasas monoinsaturadas y poliinsaturadas</p>', '["Corazón", "Cerebro"]', '<p>Presentes en aguacate, aceite de oliva, frutos secos y pescado azul. Protegen el corazón y el cerebro.</p>', 2, NOW(), NOW()),
('40000013-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', 'Grasas a Evitar', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Grasas saturadas y trans</p>', '["Salud", "Precaución"]', '<p>Reducir grasas saturadas y evitar grasas trans para mantener la salud cardiovascular.</p>', 3, NOW(), NOW());

-- Preguntas Misión 1 Nivel 6
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000011-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', '¿Dónde se encuentran proteínas completas?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000012-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', '¿Cuál es la mejor fuente de grasas saludables?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000013-0000-0000-0000-000000000000', '30000011-0000-0000-0000-000000000000', '¿Qué grasas debemos evitar?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000037-0000-0000-0000-000000000000', '50000011-0000-0000-0000-000000000000', 'Huevos, carnes, lácteos y legumbres', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Excelentes fuentes', 1, NOW()),
('60000038-0000-0000-0000-000000000000', '50000011-0000-0000-0000-000000000000', 'Solo en plantas', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'También en productos animales', 2, NOW()),
('60000039-0000-0000-0000-000000000000', '50000011-0000-0000-0000-000000000000', 'Solo en carne roja', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Hay más fuentes', 3, NOW()),
('60000040-0000-0000-0000-000000000000', '50000011-0000-0000-0000-000000000000', 'En alimentos ultraprocesados', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No son buenas fuentes', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000041-0000-0000-0000-000000000000', '50000012-0000-0000-0000-000000000000', 'Aguacate, aceite de oliva, frutos secos', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Fuentes excelentes', 1, NOW()),
('60000042-0000-0000-0000-000000000000', '50000012-0000-0000-0000-000000000000', 'Mantequilla y queso', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Son saturadas', 2, NOW()),
('60000043-0000-0000-0000-000000000000', '50000012-0000-0000-0000-000000000000', 'Alimentos fritos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Contienen grasas trans', 3, NOW()),
('60000044-0000-0000-0000-000000000000', '50000012-0000-0000-0000-000000000000', 'Leche completa', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Preferir descremada', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000045-0000-0000-0000-000000000000', '50000013-0000-0000-0000-000000000000', 'Grasas saturadas y trans', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Las más dañinas', 1, NOW()),
('60000046-0000-0000-0000-000000000000', '50000013-0000-0000-0000-000000000000', 'Grasas monoinsaturadas', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Son saludables', 2, NOW()),
('60000047-0000-0000-0000-000000000000', '50000013-0000-0000-0000-000000000000', 'Grasas de pescado', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Son omega-3', 3, NOW()),
('60000048-0000-0000-0000-000000000000', '50000013-0000-0000-0000-000000000000', 'Grasas de frutos secos', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Son saludables', 4, NOW());

-- Misión 2 Nivel 6 - Carbohidratos
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000014-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', 'Carbohidratos Complejos', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Energía sostenida</p>', '["Energía", "Sostenida"]', '<p>Encontrados en granos integrales, legumbres y verduras. Proporcionan energía duradera.</p>', 1, NOW(), NOW()),
('40000015-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', 'Fibra Dietética', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Mejora la digestión</p>', '["Digestión", "Salud"]', '<p>Esencial para la salud digestiva y regulación de glucosa. Previene el estreñimiento.</p>', 2, NOW(), NOW()),
('40000016-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', 'Carbohidratos Simples', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Energía rápida pero fugaz</p>', '["Cuidado", "Moderación"]', '<p>En azúcares refinados. Causan picos de glucosa y deben consumirse moderadamente.</p>', 3, NOW(), NOW());

-- Preguntas Misión 2
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000014-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', '¿Dónde se encuentran carbohidratos complejos?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000015-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', '¿Cuál es la función principal de la fibra?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000016-0000-0000-0000-000000000000', '30000012-0000-0000-0000-000000000000', '¿Por qué limitar los carbohidratos simples?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000049-0000-0000-0000-000000000000', '50000014-0000-0000-0000-000000000000', 'Granos integrales, legumbres y verduras', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Fuentes excelentes', 1, NOW()),
('60000050-0000-0000-0000-000000000000', '50000014-0000-0000-0000-000000000000', 'Solo en dulces', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Hay muchas fuentes saludables', 2, NOW()),
('60000051-0000-0000-0000-000000000000', '50000014-0000-0000-0000-000000000000', 'Solo en pan blanco', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'El pan integral es mejor', 3, NOW()),
('60000052-0000-0000-0000-000000000000', '50000014-0000-0000-0000-000000000000', 'Solo en refrescos', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Los refrescos tienen simples', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000053-0000-0000-0000-000000000000', '50000015-0000-0000-0000-000000000000', 'Mejorar la digestión y regular glucosa', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Función correcta', 1, NOW()),
('60000054-0000-0000-0000-000000000000', '50000015-0000-0000-0000-000000000000', 'Proporcionar energía rápida', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Esa es función de carbohidratos', 2, NOW()),
('60000055-0000-0000-0000-000000000000', '50000015-0000-0000-0000-000000000000', 'Aumentar la absorción de grasas', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'La fibra reduce absorción', 3, NOW()),
('60000056-0000-0000-0000-000000000000', '50000015-0000-0000-0000-000000000000', 'Construir músculos', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Esa es función de proteínas', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000057-0000-0000-0000-000000000000', '50000016-0000-0000-0000-000000000000', 'Causan picos de glucosa y poca saciedad', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Razones correctas', 1, NOW()),
('60000058-0000-0000-0000-000000000000', '50000016-0000-0000-0000-000000000000', 'Son tóxicos', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'No son tóxicos, solo menos saludables', 2, NOW()),
('60000059-0000-0000-0000-000000000000', '50000016-0000-0000-0000-000000000000', 'No tienen beneficios', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'En pequeñas cantidades dan energía', 3, NOW()),
('60000060-0000-0000-0000-000000000000', '50000016-0000-0000-0000-000000000000', 'Para ahorrar dinero', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No es razón de salud', 4, NOW());

-- Misión 3 Nivel 6 - Agua y Hidratación
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000017-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', 'Importancia del Agua', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>El agua es esencial para la vida</p>', '["Vital", "Salud"]', '<p>Compone 60% del cuerpo. Esencial para todas las funciones vitales.</p>', 1, NOW(), NOW()),
('40000018-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', 'Requerimientos Diarios', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Cantidad recomendada</p>', '["8 vasos", "2 litros"]', '<p>Se recomienda 8 vasos o 2 litros diarios, aunque varía según actividad y clima.</p>', 2, NOW(), NOW()),
('40000019-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', 'Señales de Deshidratación', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Síntomas a cuidar</p>', '["Sed", "Cansancio"]', '<p>Sequedad bucal, fatiga, dolores de cabeza y orina oscura son señales de deshidratación.</p>', 3, NOW(), NOW());

-- Preguntas Misión 3
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000017-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', '¿Qué porcentaje del cuerpo es agua?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000018-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', '¿Cuál es el consumo diario recomendado?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000019-0000-0000-0000-000000000000', '30000013-0000-0000-0000-000000000000', '¿Cuál es síntoma de deshidratación?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000061-0000-0000-0000-000000000000', '50000017-0000-0000-0000-000000000000', '60%', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Porcentaje correcto', 1, NOW()),
('60000062-0000-0000-0000-000000000000', '50000017-0000-0000-0000-000000000000', '40%', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es más alto', 2, NOW()),
('60000063-0000-0000-0000-000000000000', '50000017-0000-0000-0000-000000000000', '80%', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es menos', 3, NOW()),
('60000064-0000-0000-0000-000000000000', '50000017-0000-0000-0000-000000000000', '50%', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es más alto', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000065-0000-0000-0000-000000000000', '50000018-0000-0000-0000-000000000000', '8 vasos o 2 litros', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Recomendación general', 1, NOW()),
('60000066-0000-0000-0000-000000000000', '50000018-0000-0000-0000-000000000000', '3 vasos', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es insuficiente', 2, NOW()),
('60000067-0000-0000-0000-000000000000', '50000018-0000-0000-0000-000000000000', '15 vasos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es excesivo', 3, NOW()),
('60000068-0000-0000-0000-000000000000', '50000018-0000-0000-0000-000000000000', 'No hay cantidad específica', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Hay recomendación general', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000069-0000-0000-0000-000000000000', '50000019-0000-0000-0000-000000000000', 'Sequedad bucal y orina oscura', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Síntomas correctos', 1, NOW()),
('60000070-0000-0000-0000-000000000000', '50000019-0000-0000-0000-000000000000', 'Exceso de sudoración', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es demasiada agua', 2, NOW()),
('60000071-0000-0000-0000-000000000000', '50000019-0000-0000-0000-000000000000', 'Aumento de energía', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es lo opuesto', 3, NOW()),
('60000072-0000-0000-0000-000000000000', '50000019-0000-0000-0000-000000000000', 'Piel muy hidratada', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es lo opuesto', 4, NOW());

-- NIVEL DORADO: Experto Nutricional (3 contenidos + 3 preguntas)
INSERT INTO golden_level_items (id, level_id, title, detail, order_num, created_at, updated_at) VALUES
('70000004-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', 'Nutrición Personalizada', '<p>No existe un plan único para todos. La nutrición debe adaptarse a edad, género, actividad física y condiciones de salud individuales.</p>', 1, NOW(), NOW()),
('70000005-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', 'Suplementos y Complementos', '<p>Cuando la alimentación no es suficiente, los suplementos pueden ser necesarios. Sin embargo, no reemplazan una buena dieta.</p>', 2, NOW(), NOW()),
('70000006-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', 'Mitos sobre Nutrición', '<p>Existen muchos mitos en nutrición. Es importante basarse en evidencia científica para tomar decisiones sobre alimentación.</p>', 3, NOW(), NOW());

INSERT INTO golden_level_questions (id, level_id, content, order_num, is_active, created_at, updated_at) VALUES
('80000004-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', '¿Por qué es importante la nutrición personalizada?', 1, true, NOW(), NOW()),
('80000005-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', '¿Cuándo son necesarios los suplementos?', 2, true, NOW(), NOW()),
('80000006-0000-0000-0000-000000000000', '20000009-0000-0000-0000-000000000000', '¿Cuál es la base para decisiones nutricionales?', 3, true, NOW(), NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000013-0000-0000-0000-000000000000', '80000004-0000-0000-0000-000000000000', 'Porque cada persona tiene necesidades diferentes', true, 1, NOW()),
('90000014-0000-0000-0000-000000000000', '80000004-0000-0000-0000-000000000000', 'Porque todos somos iguales', false, 2, NOW()),
('90000015-0000-0000-0000-000000000000', '80000004-0000-0000-0000-000000000000', 'Para complicar las cosas', false, 3, NOW()),
('90000016-0000-0000-0000-000000000000', '80000004-0000-0000-0000-000000000000', 'Es una moda actual', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000017-0000-0000-0000-000000000000', '80000005-0000-0000-0000-000000000000', 'Cuando la alimentación no es suficiente', true, 1, NOW()),
('90000018-0000-0000-0000-000000000000', '80000005-0000-0000-0000-000000000000', 'Siempre, sin excepción', false, 2, NOW()),
('90000019-0000-0000-0000-000000000000', '80000005-0000-0000-0000-000000000000', 'Nunca son necesarios', false, 3, NOW()),
('90000020-0000-0000-0000-000000000000', '80000005-0000-0000-0000-000000000000', 'Solo para atletas profesionales', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000021-0000-0000-0000-000000000000', '80000006-0000-0000-0000-000000000000', 'Evidencia científica', true, 1, NOW()),
('90000022-0000-0000-0000-000000000000', '80000006-0000-0000-0000-000000000000', 'Tendencias de moda', false, 2, NOW()),
('90000023-0000-0000-0000-000000000000', '80000006-0000-0000-0000-000000000000', 'Lo que dicen los influencers', false, 3, NOW()),
('90000024-0000-0000-0000-000000000000', '80000006-0000-0000-0000-000000000000', 'Creencias personales', false, 4, NOW());

-- NIVEL FINAL: Nutrición Avanzada (3 preguntas con 4 opciones)
INSERT INTO final_level_questions (id, level_id, content, start_video_url, start_video_id, end_video_url, end_video_id, correct_message, incorrect_message, order_num, is_active, created_at, updated_at) VALUES
('10000004-0000-0000-0000-0000-000000000000', '20000010-0000-0000-0000-000000000000', '¿Cuál es la relación entre nutrición y enfermedades crónicas?', NULL, NULL, NULL, NULL, '<p>¡Correcto! La nutrición adecuada es fundamental para prevenir enfermedades.</p>', '<p>Incorrecto. Una buena nutrición es clave para la prevención.</p>', 1, true, NOW(), NOW()),
('10000005-0000-0000-0000-0000-000000000000', '20000010-0000-0000-0000-000000000000', '¿Cómo afecta el estrés a la nutrición?', NULL, NULL, NULL, NULL, '<p>¡Exacto! El estrés afecta los hábitos alimenticios.</p>', '<p>Incorrecto. El estrés tiene impacto en nuestras elecciones alimenticias.</p>', 2, true, NOW(), NOW()),
('10000006-0000-0000-0000-0000-000000000000', '20000010-0000-0000-0000-000000000000', '¿Qué es una dieta equilibrada?', NULL, NULL, NULL, NULL, '<p>¡Correcto! Una dieta equilibrada incluye todos los nutrientes.</p>', '<p>Incorrecto. Debe incluir proteínas, carbohidratos, grasas, vitaminas y minerales.</p>', 3, true, NOW(), NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000013-0000-0000-0000-0000-000000000000', '10000004-0000-0000-0000-0000-000000000000', 'Una buena nutrición previene enfermedades crónicas', NULL, true, 1, NOW()),
('11000014-0000-0000-0000-0000-000000000000', '10000004-0000-0000-0000-0000-000000000000', 'No hay relación', NULL, false, 2, NOW()),
('11000015-0000-0000-0000-0000-000000000000', '10000004-0000-0000-0000-0000-000000000000', 'Solo afecta el peso', NULL, false, 3, NOW()),
('11000016-0000-0000-0000-0000-000000000000', '10000004-0000-0000-0000-0000-000000000000', 'Las enfermedades son genéticas', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000017-0000-0000-0000-0000-000000000000', '10000005-0000-0000-0000-0000-000000000000', 'Afecta nuestros hábitos alimenticios', NULL, true, 1, NOW()),
('11000018-0000-0000-0000-0000-000000000000', '10000005-0000-0000-0000-0000-000000000000', 'No tiene ningún efecto', NULL, false, 2, NOW()),
('11000019-0000-0000-0000-0000-000000000000', '10000005-0000-0000-0000-0000-000000000000', 'Solo afecta el sueño', NULL, false, 3, NOW()),
('11000020-0000-0000-0000-0000-000000000000', '10000005-0000-0000-0000-0000-000000000000', 'Aumenta el metabolismo', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('11000021-0000-0000-0000-0000-000000000000', '10000006-0000-0000-0000-0000-000000000000', 'Incluye todos los nutrientes en proporción adecuada', NULL, true, 1, NOW()),
('11000022-0000-0000-0000-0000-000000000000', '10000006-0000-0000-0000-0000-000000000000', 'Solo frutas y verduras', NULL, false, 2, NOW()),
('11000023-0000-0000-0000-0000-000000000000', '10000006-0000-0000-0000-0000-000000000000', 'Solo proteína', NULL, false, 3, NOW()),
('11000024-0000-0000-0000-0000-000000000000', '10000006-0000-0000-0000-0000-000000000000', 'Sin grasas ni carbohidratos', NULL, false, 4, NOW());

COMMIT;

-- ============================================================
-- MUNDO 3: BIENESTAR
-- ============================================================

-- NIVEL 11: Actividad Física (3 misiones)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
('30000021-0000-0000-0000-000000000000', '20000011-0000-0000-0000-000000000000', 'Misión 1: Beneficios del Ejercicio', 'Movimiento y salud', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
('30000022-0000-0000-0000-000000000000', '20000011-0000-0000-0000-000000000000', 'Misión 2: Tipos de Ejercicio', 'Cardio, fuerza y flexibilidad', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
('30000023-0000-0000-0000-000000000000', '20000011-0000-0000-0000-000000000000', 'Misión 3: Seguridad en Ejercicio', 'Prevenir lesiones', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW());

-- Contenidos Misión 1 Nivel 11
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000021-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', 'Beneficios Cardiovasculares', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Fortalece el corazón</p>', '["Corazón", "Salud"]', '<p>El ejercicio regular reduce el riesgo de enfermedades cardiovasculares y mejora la circulación.</p>', 1, NOW(), NOW()),
('40000022-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', 'Beneficios Mentales', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Mejora el bienestar emocional</p>', '["Mente", "Felicidad"]', '<p>Reduce estrés, ansiedad y depresión. Aumenta la producción de endorfinas.</p>', 2, NOW(), NOW()),
('40000023-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', 'Beneficios Metabólicos', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Acelera el metabolismo</p>', '["Peso", "Energía"]', '<p>Aumenta el gasto calórico, mejora la composición corporal y mantiene el peso saludable.</p>', 3, NOW(), NOW());

-- Preguntas Misión 1
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000021-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', '¿Qué beneficio cardiovascular tiene el ejercicio?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000022-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', '¿Qué sustancia produce el ejercicio en el cerebro?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000023-0000-0000-0000-000000000000', '30000021-0000-0000-0000-000000000000', '¿Cómo afecta el ejercicio al metabolismo?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000073-0000-0000-0000-000000000000', '50000021-0000-0000-0000-000000000000', 'Fortalece el corazón y mejora la circulación', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Beneficio correcto', 1, NOW()),
('60000074-0000-0000-0000-000000000000', '50000021-0000-0000-0000-000000000000', 'Debilita el corazón', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es lo opuesto', 2, NOW()),
('60000075-0000-0000-0000-000000000000', '50000021-0000-0000-0000-000000000000', 'Aumenta la presión arterial', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'La reduce', 3, NOW()),
('60000076-0000-0000-0000-000000000000', '50000021-0000-0000-0000-000000000000', 'No tiene efecto', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Tiene muchos efectos', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000077-0000-0000-0000-000000000000', '50000022-0000-0000-0000-000000000000', 'Endorfinas', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Sustancia correcta', 1, NOW()),
('60000078-0000-0000-0000-000000000000', '50000022-0000-0000-0000-000000000000', 'Cortisol', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es una hormona del estrés', 2, NOW()),
('60000079-0000-0000-0000-000000000000', '50000022-0000-0000-0000-000000000000', 'Insulina', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Regula glucosa', 3, NOW()),
('60000080-0000-0000-0000-000000000000', '50000022-0000-0000-0000-000000000000', 'Adrenalina únicamente', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'También endorfinas', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000081-0000-0000-0000-000000000000', '50000023-0000-0000-0000-000000000000', 'Lo acelera aumentando el gasto calórico', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Efecto correcto', 1, NOW()),
('60000082-0000-0000-0000-000000000000', '50000023-0000-0000-0000-000000000000', 'Lo ralentiza', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es lo opuesto', 2, NOW()),
('60000083-0000-0000-0000-000000000000', '50000023-0000-0000-0000-000000000000', 'No tiene efecto', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Tiene efecto importante', 3, NOW()),
('60000084-0000-0000-0000-000000000000', '50000023-0000-0000-0000-000000000000', 'Solo afecta músculos', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Afecta metabolismo general', 4, NOW());

-- Misión 2 Nivel 11 - Tipos de Ejercicio
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000024-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', 'Ejercicio Cardiovascular', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Entrena el corazón</p>', '["Cardio", "Resistencia"]', '<p>Correr, nadar, ciclismo. Mejora la resistencia y salud cardiovascular.</p>', 1, NOW(), NOW()),
('40000025-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', 'Entrenamiento de Fuerza', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Fortalece músculos</p>', '["Fuerza", "Músculo"]', '<p>Levantamiento de pesas, resistencia. Construye y mantiene masa muscular.</p>', 2, NOW(), NOW()),
('40000026-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', 'Flexibilidad y Equilibrio', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Mejora movilidad</p>', '["Yoga", "Balance"]', '<p>Yoga, pilates. Mejora flexibilidad, equilibrio y previene lesiones.</p>', 3, NOW(), NOW());

-- Preguntas Misión 2
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000024-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', '¿Cuál es el beneficio principal del cardio?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000025-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', '¿Qué construye el entrenamiento de fuerza?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000026-0000-0000-0000-000000000000', '30000022-0000-0000-0000-000000000000', '¿Cuál es el ejemplo de ejercicio de flexibilidad?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000085-0000-0000-0000-000000000000', '50000024-0000-0000-0000-000000000000', 'Mejorar resistencia cardiovascular', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Beneficio principal', 1, NOW()),
('60000086-0000-0000-0000-000000000000', '50000024-0000-0000-0000-000000000000', 'Aumentar masa muscular', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es de fuerza', 2, NOW()),
('60000087-0000-0000-0000-000000000000', '50000024-0000-0000-0000-000000000000', 'Mejorar flexibilidad', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Eso es del yoga', 3, NOW()),
('60000088-0000-0000-0000-000000000000', '50000024-0000-0000-0000-000000000000', 'Perder pelo', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No es un beneficio', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000089-0000-0000-0000-000000000000', '50000025-0000-0000-0000-000000000000', 'Masa muscular', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Construcción correcta', 1, NOW()),
('60000090-0000-0000-0000-000000000000', '50000025-0000-0000-0000-000000000000', 'Flexibilidad', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es del yoga', 2, NOW()),
('60000091-0000-0000-0000-000000000000', '50000025-0000-0000-0000-000000000000', 'Resistencia cardiovascular', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Eso es del cardio', 3, NOW()),
('60000092-0000-0000-0000-000000000000', '50000025-0000-0000-0000-000000000000', 'Perder peso solo', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Construye músculo', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000093-0000-0000-0000-000000000000', '50000026-0000-0000-0000-000000000000', 'Yoga y Pilates', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Ejemplos correctos', 1, NOW()),
('60000094-0000-0000-0000-000000000000', '50000026-0000-0000-0000-000000000000', 'Correr y nadar', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es cardio', 2, NOW()),
('60000095-0000-0000-0000-000000000000', '50000026-0000-0000-0000-000000000000', 'Levantamiento de pesas', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Eso es fuerza', 3, NOW()),
('60000096-0000-0000-0000-000000000000', '50000026-0000-0000-0000-000000000000', 'Boxeo', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es cardio y fuerza', 4, NOW());

-- Misión 3 Nivel 11 - Seguridad
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000027-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', 'Calentamiento Previo', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Prepara el cuerpo</p>', '["Prevención", "Seguridad"]', '<p>Aumenta temperatura corporal y flexibilidad. Esencial antes de cualquier ejercicio.</p>', 1, NOW(), NOW()),
('40000028-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', 'Forma y Técnica', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Ejecutar correctamente</p>', '["Técnica", "Precisión"]', '<p>Una forma incorrecta causa lesiones. Importante aprender técnica correcta.</p>', 2, NOW(), NOW()),
('40000029-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', 'Descanso y Recuperación', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Permite la regeneración</p>', '["Descanso", "Salud"]', '<p>El descanso es parte del entrenamiento. Permite que los músculos se reparen y crezcan.</p>', 3, NOW(), NOW());

-- Preguntas Misión 3
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000027-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', '¿Por qué es importante el calentamiento?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000028-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', '¿Qué causa lesiones al ejercitarse?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000029-0000-0000-0000-000000000000', '30000023-0000-0000-0000-000000000000', '¿Qué permite el descanso?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000097-0000-0000-0000-000000000000', '50000027-0000-0000-0000-000000000000', 'Prepara cuerpo y aumenta flexibilidad', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Razón correcta', 1, NOW()),
('60000098-0000-0000-0000-000000000000', '50000027-0000-0000-0000-000000000000', 'Pierde tiempo', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Previene lesiones', 2, NOW()),
('60000099-0000-0000-0000-000000000000', '50000027-0000-0000-0000-000000000000', 'No es importante', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es muy importante', 3, NOW()),
('60000100-0000-0000-0000-000000000000', '50000027-0000-0000-0000-000000000000', 'Solo si hace frío', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Siempre es necesario', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000101-0000-0000-0000-000000000000', '50000028-0000-0000-0000-000000000000', 'Una forma o técnica incorrecta', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Causa principal', 1, NOW()),
('60000102-0000-0000-0000-000000000000', '50000028-0000-0000-0000-000000000000', 'Hacer ejercicio', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Si se hace bien no', 2, NOW()),
('60000103-0000-0000-0000-000000000000', '50000028-0000-0000-0000-000000000000', 'Descanso después', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Previene lesiones', 3, NOW()),
('60000104-0000-0000-0000-000000000000', '50000028-0000-0000-0000-000000000000', 'Usar ropa deportiva', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No es la causa', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000105-0000-0000-0000-000000000000', '50000029-0000-0000-0000-000000000000', 'Reparación y crecimiento muscular', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Función correcta', 1, NOW()),
('60000106-0000-0000-0000-000000000000', '50000029-0000-0000-0000-000000000000', 'Debilitamiento del cuerpo', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es lo opuesto', 2, NOW()),
('60000107-0000-0000-0000-000000000000', '50000029-0000-0000-0000-000000000000', 'Pérdida de ganancias', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'El descanso ayuda', 3, NOW()),
('60000108-0000-0000-0000-000000000000', '50000029-0000-0000-0000-000000000000', 'No permite nada importante', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es esencial', 4, NOW());

-- NIVEL DORADO: Bienestar Integral (3 contenidos + 3 preguntas)
INSERT INTO golden_level_items (id, level_id, title, detail, order_num, created_at, updated_at) VALUES
('70000007-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', 'Holismo en Bienestar', '<p>El bienestar no solo es físico. Incluye salud mental, emocional, espiritual y social.</p>', 1, NOW(), NOW()),
('70000008-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', 'Mindfulness y Meditación', '<p>Técnicas para reducir estrés, mejorar concentración y aumentar conciencia del presente.</p>', 2, NOW(), NOW()),
('70000009-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', 'Conexión Mente-Cuerpo', '<p>La salud mental y física están conectadas. Cuidar ambas es fundamental.</p>', 3, NOW(), NOW());

INSERT INTO golden_level_questions (id, level_id, content, order_num, is_active, created_at, updated_at) VALUES
('80000007-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', '¿Qué dimensiones incluye el bienestar integral?', 1, true, NOW(), NOW()),
('80000008-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', '¿Cuál es el beneficio del mindfulness?', 2, true, NOW(), NOW()),
('80000009-0000-0000-0000-000000000000', '20000014-0000-0000-0000-000000000000', '¿Por qué es importante la conexión mente-cuerpo?', 3, true, NOW(), NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000025-0000-0000-0000-000000000000', '80000007-0000-0000-0000-000000000000', 'Física, mental, emocional, espiritual y social', true, 1, NOW()),
('90000026-0000-0000-0000-000000000000', '80000007-0000-0000-0000-000000000000', 'Solo física', false, 2, NOW()),
('90000027-0000-0000-0000-000000000000', '80000007-0000-0000-0000-000000000000', 'Solo mental', false, 3, NOW()),
('90000028-0000-0000-0000-000000000000', '80000007-0000-0000-0000-000000000000', 'Solo social', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000029-0000-0000-0000-000000000000', '80000008-0000-0000-0000-000000000000', 'Reducir estrés y mejorar concentración', true, 1, NOW()),
('90000030-0000-0000-0000-000000000000', '80000008-0000-0000-0000-000000000000', 'Aumentar peso', false, 2, NOW()),
('90000031-0000-0000-0000-000000000000', '80000008-0000-0000-0000-000000000000', 'Disminuir inteligencia', false, 3, NOW()),
('90000032-0000-0000-0000-000000000000', '80000008-0000-0000-0000-000000000000', 'Perder dinero', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000033-0000-0000-0000-000000000000', '80000009-0000-0000-0000-000000000000', 'Porque están interconectadas', true, 1, NOW()),
('90000034-0000-0000-0000-000000000000', '80000009-0000-0000-0000-000000000000', 'Porque está de moda', false, 2, NOW()),
('90000035-0000-0000-0000-000000000000', '80000009-0000-0000-0000-000000000000', 'No hay razón importante', false, 3, NOW()),
('90000036-0000-0000-0000-000000000000', '80000009-0000-0000-0000-000000000000', 'Solo por dinero', false, 4, NOW());

-- NIVEL FINAL: Vida Saludable (3 preguntas con 4 opciones)
INSERT INTO final_level_questions (id, level_id, content, start_video_url, start_video_id, end_video_url, end_video_id, correct_message, incorrect_message, order_num, is_active, created_at, updated_at) VALUES
('1000007-0000-0000-0000-0000-000000000000', '20000015-0000-0000-0000-000000000000', '¿Cuál es la frecuencia recomendada de ejercicio?', NULL, NULL, NULL, NULL, '<p>¡Correcto! 150 minutos semanales es la recomendación.</p>', '<p>Incorrecto. La OMS recomienda 150 minutos de actividad moderada.</p>', 1, true, NOW(), NOW()),
('1000008-0000-0000-0000-0000-000000000000', '20000015-0000-0000-0000-000000000000', '¿Qué es lo más importante en bienestar?', NULL, NULL, NULL, NULL, '<p>¡Exacto! Es un equilibrio de múltiples factores.</p>', '<p>Incorrecto. El bienestar requiere un enfoque integral.</p>', 2, true, NOW(), NOW()),
('1000009-0000-0000-0000-0000-000000000000', '20000015-0000-0000-0000-000000000000', '¿Cómo impacta el sueño en la salud?', NULL, NULL, NULL, NULL, '<p>¡Correcto! El sueño es crucial para todo.</p>', '<p>Incorrecto. Una buena calidad de sueño es esencial para la recuperación.</p>', 3, true, NOW(), NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100025-0000-0000-0000-0000-000000000000', '1000007-0000-0000-0000-0000-000000000000', '150 minutos semanales de actividad moderada', NULL, true, 1, NOW()),
('1100026-0000-0000-0000-0000-000000000000', '1000007-0000-0000-0000-0000-000000000000', 'Todos los días 24 horas', NULL, false, 2, NOW()),
('1100027-0000-0000-0000-0000-000000000000', '1000007-0000-0000-0000-0000-000000000000', 'Solo en fines de semana', NULL, false, 3, NOW()),
('1100028-0000-0000-0000-0000-000000000000', '1000007-0000-0000-0000-0000-000000000000', 'No es necesario', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100029-0000-0000-0000-0000-000000000000', '1000008-0000-0000-0000-0000-000000000000', 'El balance entre físico, mental y emocional', NULL, true, 1, NOW()),
('1100030-0000-0000-0000-0000-000000000000', '1000008-0000-0000-0000-0000-000000000000', 'Solo hacer ejercicio', NULL, false, 2, NOW()),
('1100031-0000-0000-0000-0000-000000000000', '1000008-0000-0000-0000-0000-000000000000', 'Solo buena nutrición', NULL, false, 3, NOW()),
('1100032-0000-0000-0000-0000-000000000000', '1000008-0000-0000-0000-0000-000000000000', 'Solo dinero', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100033-0000-0000-0000-0000-000000000000', '1000009-0000-0000-0000-0000-000000000000', 'Impacta recuperación, cognición y sistema inmune', NULL, true, 1, NOW()),
('1100034-0000-0000-0000-0000-000000000000', '1000009-0000-0000-0000-0000-000000000000', 'No tiene impacto', NULL, false, 2, NOW()),
('1100035-0000-0000-0000-0000-000000000000', '1000009-0000-0000-0000-0000-000000000000', 'Solo afecta el humor', NULL, false, 3, NOW()),
('1100036-0000-0000-0000-0000-000000000000', '1000009-0000-0000-0000-0000-000000000000', 'Es menos importante que dieta', NULL, false, 4, NOW());

-- ============================================================
-- MUNDO 4: BELLEZA (datos simplificados como referencia)
-- ============================================================

-- NIVEL 16: Cuidado de Piel (3 misiones simplificadas)
INSERT INTO missions (id, level_id, name, description, image_id, order_num, max_stars, is_active, created_at, updated_at) VALUES
('30000031-0000-0000-0000-000000000000', '20000016-0000-0000-0000-000000000000', 'Misión 1: Tipos de Piel', 'Conocer tu piel', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 3, true, NOW(), NOW()),
('30000032-0000-0000-0000-000000000000', '20000016-0000-0000-0000-000000000000', 'Misión 2: Rutina Básica', 'Limpieza y cuidado', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 3, true, NOW(), NOW()),
('30000033-0000-0000-0000-000000000000', '20000016-0000-0000-0000-000000000000', 'Misión 3: Protección Solar', 'Prevención de daño', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 3, true, NOW(), NOW());

-- Contenidos y preguntas simplificadas para Mundo 4
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000031-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', 'Piel Grasa', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Más producción sebácea</p>', '["Grasa", "Brillo"]', '<p>Propensa al acné. Requiere limpieza regular.</p>', 1, NOW(), NOW()),
('40000032-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', 'Piel Seca', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Falta de hidratación</p>', '["Seca", "Tirantez"]', '<p>Requiere humectantes y serums hidratantes.</p>', 2, NOW(), NOW()),
('40000033-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', 'Piel Mixta', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Combinación de tipos</p>', '["Mixta", "Equilibrio"]', '<p>Requiere cuidados específicos para cada zona.</p>', 3, NOW(), NOW());

-- Preguntas Misión 1 Mundo 4
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000031-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', '¿Cuál es característica de piel grasa?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000032-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', '¿Qué necesita la piel seca?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000033-0000-0000-0000-000000000000', '30000031-0000-0000-0000-000000000000', '¿Cómo se caracteriza piel mixta?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000109-0000-0000-0000-000000000000', '50000031-0000-0000-0000-000000000000', 'Mayor producción de sebo', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Característica correcta', 1, NOW()),
('60000110-0000-0000-0000-000000000000', '50000031-0000-0000-0000-000000000000', 'Falta de hidratación', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso es piel seca', 2, NOW()),
('60000111-0000-0000-0000-000000000000', '50000031-0000-0000-0000-000000000000', 'Muy pálida', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'No es característica', 3, NOW()),
('60000112-0000-0000-0000-000000000000', '50000031-0000-0000-0000-000000000000', 'Siempre rojiza', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No siempre', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000113-0000-0000-0000-000000000000', '50000032-0000-0000-0000-000000000000', 'Humectantes y serums hidratantes', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Cuidados correctos', 1, NOW()),
('60000114-0000-0000-0000-000000000000', '50000032-0000-0000-0000-000000000000', 'Productos desecantes', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Empeoraría', 2, NOW()),
('60000115-0000-0000-0000-000000000000', '50000032-0000-0000-0000-000000000000', 'Nada, se seca sola', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Necesita cuidados', 3, NOW()),
('60000116-0000-0000-0000-000000000000', '50000032-0000-0000-0000-000000000000', 'Solo agua fría', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'No es suficiente', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000117-0000-0000-0000-000000000000', '50000033-0000-0000-0000-000000000000', 'Combinación de tipos en diferentes zonas', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Característica correcta', 1, NOW()),
('60000118-0000-0000-0000-000000000000', '50000033-0000-0000-0000-000000000000', 'Siempre grasosa', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'No, es mixta', 2, NOW()),
('60000119-0000-0000-0000-000000000000', '50000033-0000-0000-0000-000000000000', 'Siempre seca', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'No, es mixta', 3, NOW()),
('60000120-0000-0000-0000-000000000000', '50000033-0000-0000-0000-000000000000', 'No existe este tipo', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es el tipo más común', 4, NOW());

-- Misión 2 Nivel 16
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000034-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', 'Limpieza Facial', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Primer paso</p>', '["Limpieza", "Diaria"]', '<p>Elimina impurezas. Hacer mañana y noche.</p>', 1, NOW(), NOW()),
('40000035-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', 'Tonificación', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Equilibra pH</p>', '["Tónico", "Balance"]', '<p>Prepara la piel para serums y cremas.</p>', 2, NOW(), NOW()),
('40000036-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', 'Hidratación', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Paso final</p>', '["Crema", "Hidratación"]', '<p>Sella la hidratación de la piel.</p>', 3, NOW(), NOW());

-- Preguntas Misión 2
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000034-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', '¿Con qué frecuencia limpiar la piel?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000035-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', '¿Cuál es función del tónico?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000036-0000-0000-0000-000000000000', '30000032-0000-0000-0000-000000000000', '¿Cuándo aplicar la crema hidratante?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000121-0000-0000-0000-000000000000', '50000034-0000-0000-0000-000000000000', 'Mañana y noche', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Frecuencia correcta', 1, NOW()),
('60000122-0000-0000-0000-000000000000', '50000034-0000-0000-0000-000000000000', 'Solo una vez al día', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Debe ser dos veces', 2, NOW()),
('60000123-0000-0000-0000-000000000000', '50000034-0000-0000-0000-000000000000', 'Solo una vez a la semana', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Debe ser diaria', 3, NOW()),
('60000124-0000-0000-0000-000000000000', '50000034-0000-0000-0000-000000000000', 'Según aparente suciedad', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Debe ser regular', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000125-0000-0000-0000-000000000000', '50000035-0000-0000-0000-000000000000', 'Equilibrar pH y preparar piel', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Función correcta', 1, NOW()),
('60000126-0000-0000-0000-000000000000', '50000035-0000-0000-0000-000000000000', 'Limpiar nuevamente', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Eso ya lo hace el limpiador', 2, NOW()),
('60000127-0000-0000-0000-000000000000', '50000035-0000-0000-0000-000000000000', 'Secar completamente', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Deja la piel con humedad', 3, NOW()),
('60000128-0000-0000-0000-000000000000', '50000035-0000-0000-0000-000000000000', 'Irritar la piel', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Calma la piel', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000129-0000-0000-0000-000000000000', '50000036-0000-0000-0000-000000000000', 'Al final de la rutina', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Orden correcto', 1, NOW()),
('60000130-0000-0000-0000-000000000000', '50000036-0000-0000-0000-000000000000', 'Al principio', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Otros productos pueden no absorber', 2, NOW()),
('60000131-0000-0000-0000-000000000000', '50000036-0000-0000-0000-000000000000', 'Cualquier momento', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'El orden importa', 3, NOW()),
('60000132-0000-0000-0000-000000000000', '50000036-0000-0000-0000-000000000000', 'No importa el orden', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'El orden es importante', 4, NOW());

-- Misión 3 Nivel 16 - Protección Solar
INSERT INTO mission_items (id, mission_id, title, image_id, benefits, content_badges, detail, order_num, created_at, updated_at) VALUES
('40000037-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', 'Importancia del Protector Solar', '4891df8a-7353-4399-8c14-c3a55e2a738f', '<p>Protección vital</p>', '["UV", "Protección"]', '<p>Previene envejecimiento prematuro y cáncer de piel.</p>', 1, NOW(), NOW()),
('40000038-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', 'FPS Adecuado', '81755fb5-9edf-4389-b060-a7f9b6ff681d', '<p>Factor de protección</p>', '["SPF", "Mínimo 30"]', '<p>Usar FPS 30 o superior. Reaplicar cada 2 horas.</p>', 2, NOW(), NOW()),
('40000039-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', 'Protectores Diarios', 'cd938867-a5eb-48f5-a45b-deaed387db5f', '<p>Uso cotidiano</p>', '["Diario", "Necesario"]', '<p>Incluso en días nublados. La protección solar debe ser diaria.</p>', 3, NOW(), NOW());

-- Preguntas Misión 3
INSERT INTO questions (id, mission_id, content, image_id, order_num, stars_value, is_active, created_at, updated_at) VALUES
('50000037-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', '¿Qué previene el protector solar?', '4891df8a-7353-4399-8c14-c3a55e2a738f', 1, 1, true, NOW(), NOW()),
('50000038-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', '¿Cuál es el FPS mínimo recomendado?', '81755fb5-9edf-4389-b060-a7f9b6ff681d', 2, 1, true, NOW(), NOW()),
('50000039-0000-0000-0000-000000000000', '30000033-0000-0000-0000-000000000000', '¿Cuándo usar protector solar?', 'cd938867-a5eb-48f5-a45b-deaed387db5f', 3, 1, true, NOW(), NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000133-0000-0000-0000-000000000000', '50000037-0000-0000-0000-000000000000', 'Envejecimiento y cáncer de piel', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Prevención correcta', 1, NOW()),
('60000134-0000-0000-0000-000000000000', '50000037-0000-0000-0000-000000000000', 'Acné solamente', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Previene más que eso', 2, NOW()),
('60000135-0000-0000-0000-000000000000', '50000037-0000-0000-0000-000000000000', 'Nada importante', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es muy importante', 3, NOW()),
('60000136-0000-0000-0000-000000000000', '50000037-0000-0000-0000-000000000000', 'Solo quemaduras', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Previene más', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000137-0000-0000-0000-000000000000', '50000038-0000-0000-0000-000000000000', 'FPS 30 o superior', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Recomendación correcta', 1, NOW()),
('60000138-0000-0000-0000-000000000000', '50000038-0000-0000-0000-000000000000', 'FPS 5', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Es muy bajo', 2, NOW()),
('60000139-0000-0000-0000-000000000000', '50000038-0000-0000-0000-000000000000', 'FPS 15', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'Es bajo', 3, NOW()),
('60000140-0000-0000-0000-000000000000', '50000038-0000-0000-0000-000000000000', 'No hay mínimo', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Sí hay recomendación', 4, NOW());

INSERT INTO answer_options (id, question_id, text, image_id, is_correct, detail, order_num, created_at) VALUES
('60000141-0000-0000-0000-000000000000', '50000039-0000-0000-0000-000000000000', 'Todos los días, incluso nublados', '4891df8a-7353-4399-8c14-c3a55e2a738f', true, 'Uso correcto', 1, NOW()),
('60000142-0000-0000-0000-000000000000', '50000039-0000-0000-0000-000000000000', 'Solo en playa', '81755fb5-9edf-4389-b060-a7f9b6ff681d', false, 'Debe ser diario', 2, NOW()),
('60000143-0000-0000-0000-000000000000', '50000039-0000-0000-0000-000000000000', 'Solo cuando hace sol', 'cd938867-a5eb-48f5-a45b-deaed387db5f', false, 'También en días nublados', 3, NOW()),
('60000144-0000-0000-0000-000000000000', '50000039-0000-0000-0000-000000000000', 'Nunca, daña la piel', 'f9d1a6fd-2d98-40e3-a063-09121a1c9b20', false, 'Es beneficioso', 4, NOW());

-- NIVEL DORADO: Experto en Belleza (3 contenidos + 3 preguntas)
INSERT INTO golden_level_items (id, level_id, title, detail, order_num, created_at, updated_at) VALUES
('70000010-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', 'Ingredientes Cosméticos Efectivos', '<p>Conocer ingredientes como ácido hialurónico, retinol y péptidos es fundamental para elegir productos correctos.</p>', 1, NOW(), NOW()),
('70000011-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', 'Skincare Personalizado', '<p>Cada piel tiene necesidades diferentes. Crear una rutina personalizada es más importante que seguir tendencias.</p>', 2, NOW(), NOW()),
('70000012-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', 'Belleza y Bienestar', '<p>La belleza externa es reflejo de la salud interna. Nutrición, sueño y estrés impactan la apariencia.</p>', 3, NOW(), NOW());

INSERT INTO golden_level_questions (id, level_id, content, order_num, is_active, created_at, updated_at) VALUES
('80000010-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', '¿Por qué es importante conocer ingredientes?', 1, true, NOW(), NOW()),
('80000011-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', '¿Cuál es clave en skincare?', 2, true, NOW(), NOW()),
('80000012-0000-0000-0000-000000000000', '20000019-0000-0000-0000-000000000000', '¿Qué impacta belleza externa?', 3, true, NOW(), NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000037-0000-0000-0000-000000000000', '80000010-0000-0000-0000-000000000000', 'Para elegir productos efectivos', true, 1, NOW()),
('90000038-0000-0000-0000-000000000000', '80000010-0000-0000-0000-000000000000', 'Para impresionar amigos', false, 2, NOW()),
('90000039-0000-0000-0000-000000000000', '80000010-0000-0000-0000-000000000000', 'No es importante', false, 3, NOW()),
('90000040-0000-0000-0000-000000000000', '80000010-0000-0000-0000-000000000000', 'Es solo moda', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000041-0000-0000-0000-000000000000', '80000011-0000-0000-0000-000000000000', 'Personalizar según tipo de piel', true, 1, NOW()),
('90000042-0000-0000-0000-000000000000', '80000011-0000-0000-0000-000000000000', 'Seguir tendencias', false, 2, NOW()),
('90000043-0000-0000-0000-000000000000', '80000011-0000-0000-0000-000000000000', 'Usar lo más caro', false, 3, NOW()),
('90000044-0000-0000-0000-000000000000', '80000011-0000-0000-0000-000000000000', 'Gastar mucho dinero', false, 4, NOW());

INSERT INTO golden_level_answer_options (id, question_id, text, is_correct, order_num, created_at) VALUES
('90000045-0000-0000-0000-000000000000', '80000012-0000-0000-0000-000000000000', 'Nutrición, sueño y bienestar', true, 1, NOW()),
('90000046-0000-0000-0000-000000000000', '80000012-0000-0000-0000-000000000000', 'Solo cosméticos', false, 2, NOW()),
('90000047-0000-0000-0000-000000000000', '80000012-0000-0000-0000-000000000000', 'Dinero únicamente', false, 3, NOW()),
('90000048-0000-0000-0000-000000000000', '80000012-0000-0000-0000-000000000000', 'Nada importante', false, 4, NOW());

-- NIVEL FINAL: Arte de la Belleza (3 preguntas con 4 opciones)
INSERT INTO final_level_questions (id, level_id, content, start_video_url, start_video_id, end_video_url, end_video_id, correct_message, incorrect_message, order_num, is_active, created_at, updated_at) VALUES
('1000010-0000-0000-0000-0000-000000000000', '20000020-0000-0000-0000-000000000000', '¿Cuál es el orden correcto en skincare?', NULL, NULL, NULL, NULL, '<p>¡Correcto! Limpieza, tónico, sérum, crema, protector solar.</p>', '<p>Incorrecto. El orden es fundamental para la efectividad.</p>', 1, true, NOW(), NOW()),
('1000011-0000-0000-0000-0000-000000000000', '20000020-0000-0000-0000-000000000000', '¿Cuánto tiempo toma ver resultados?', NULL, NULL, NULL, NULL, '<p>¡Exacto! La constancia es clave, mínimo 4-6 semanas.</p>', '<p>Incorrecto. Los resultados requieren tiempo y consistencia.</p>', 2, true, NOW(), NOW()),
('1000012-0000-0000-0000-0000-000000000000', '20000020-0000-0000-0000-000000000000', '¿Cómo mantener piel saludable?', NULL, NULL, NULL, NULL, '<p>¡Correcto! Es una combinación de factores internos y externos.</p>', '<p>Incorrecto. Se requiere un enfoque integral.</p>', 3, true, NOW(), NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100037-0000-0000-0000-0000-000000000000', '1000010-0000-0000-0000-0000-000000000000', 'Limpiar, tonificar, sérum, crema, protector', NULL, true, 1, NOW()),
('1100038-0000-0000-0000-0000-000000000000', '1000010-0000-0000-0000-0000-000000000000', 'Cualquier orden funciona', NULL, false, 2, NOW()),
('1100039-0000-0000-0000-0000-000000000000', '1000010-0000-0000-0000-0000-000000000000', 'Solo protector solar importa', NULL, false, 3, NOW()),
('1100040-0000-0000-0000-0000-000000000000', '1000010-0000-0000-0000-0000-000000000000', 'El orden no importa', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100041-0000-0000-0000-0000-000000000000', '1000011-0000-0000-0000-0000-000000000000', '4 a 6 semanas mínimo', NULL, true, 1, NOW()),
('1100042-0000-0000-0000-0000-000000000000', '1000011-0000-0000-0000-0000-000000000000', 'Una semana', NULL, false, 2, NOW()),
('1100043-0000-0000-0000-0000-000000000000', '1000011-0000-0000-0000-0000-000000000000', 'Inmediatamente', NULL, false, 3, NOW()),
('1100044-0000-0000-0000-0000-000000000000', '1000011-0000-0000-0000-0000-000000000000', 'Nunca se ven resultados', NULL, false, 4, NOW());

INSERT INTO final_level_answer_options (id, question_id, text, image_id, is_correct, order_num, created_at) VALUES
('1100045-0000-0000-0000-0000-000000000000', '1000012-0000-0000-0000-0000-000000000000', 'Skincare diario y salud integral', NULL, true, 1, NOW()),
('1100046-0000-0000-0000-0000-000000000000', '1000012-0000-0000-0000-0000-000000000000', 'Solo cosméticos caros', NULL, false, 2, NOW()),
('1100047-0000-0000-0000-0000-000000000000', '1000012-0000-0000-0000-0000-000000000000', 'Maquillaje pesado', NULL, false, 3, NOW()),
('1100048-0000-0000-0000-0000-000000000000', '1000012-0000-0000-0000-0000-000000000000', 'Procedimientos costosos', NULL, false, 4, NOW());

COMMIT;
