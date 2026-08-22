-- ============================================================
-- FARMATOUR5 - Datos Iniciales del Juego
-- Versión: 1.0
-- Descripción: Data seed con 5 mundos, niveles, misiones, items y preguntas
-- ============================================================

-- Limpiar datos existentes (opcional - descomentar si es necesario)
-- TRUNCATE TABLE participant_world_exam_answers, participant_level_exam_answers, 
--   participant_world_progress, participant_level_progress, participant_mission_progress, 
--   participant_answers, world_exam_options, world_exam_questions, world_exams,
--   level_exam_options, level_exam_questions, level_exams,
--   answer_options, questions, mission_items, missions, levels, worlds CASCADE;

-- ============================================================
-- GRUPO DE EJEMPLO
-- ============================================================
INSERT INTO groups (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Grupo Alpha', 'Grupo de ejemplo para participantes');

-- ============================================================
-- MUNDOS (5 mundos)
-- ============================================================
INSERT INTO worlds (id, name, description, order_num, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'Farma', 'Descubre el fascinante mundo de la farmacología y los medicamentos', 1, TRUE),
('10000000-0000-0000-0000-000000000002', 'Nutrición', 'Aprende sobre alimentación saludable y suplementos nutricionales', 2, TRUE),
('10000000-0000-0000-0000-000000000003', 'Consumo', 'Conoce los productos de consumo diario y cuidado personal', 3, TRUE),
('10000000-0000-0000-0000-000000000004', 'Wellness', 'Explora el bienestar integral y la vida saludable', 4, TRUE),
('10000000-0000-0000-0000-000000000005', 'Beauty', 'Sumérgete en el mundo de la belleza y el cuidado de la piel', 5, TRUE);

-- ============================================================
-- NIVELES (4 por mundo: 3 normales + 1 dorado = 20 niveles)
-- ============================================================

-- MUNDO FARMA (4 niveles)
INSERT INTO levels (id, world_id, name, description, order_num, is_golden, max_stars, is_active) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Nivel 1: Fundamentos Farmacéuticos', 'Conceptos básicos de farmacología', 1, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Nivel 2: Medicamentos Comunes', 'Medicamentos de uso frecuente', 2, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Nivel 3: Interacciones Medicamentosas', 'Cómo interactúan los medicamentos', 3, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Nivel Dorado: Maestro del Mundo Farma', 'Desafío dorado del mundo farmacéutico', 4, TRUE, 18, TRUE),

-- MUNDO NUTRICIÓN (4 niveles)
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Nivel 1: Nutrientes Esenciales', 'Conoce los nutrientes que tu cuerpo necesita', 1, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Nivel 2: Dietas Saludables', 'Planes de alimentación balanceada', 2, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Nivel 3: Suplementación Nutricional', 'Cuándo y cómo suplementar', 3, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'Nivel Dorado: Maestro de la Nutrición', 'Desafío dorado nutricional', 4, TRUE, 18, TRUE),

-- MUNDO CONSUMO (4 niveles)
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Nivel 1: Productos de Higiene', 'Cuidado personal diario', 1, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'Nivel 2: Productos para el Hogar', 'Limpieza y cuidado del hogar', 2, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', 'Nivel 3: Consumo Responsable', 'Compra inteligente y sostenible', 3, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003', 'Nivel Dorado: Maestro del Consumo', 'Desafío dorado del consumo', 4, TRUE, 18, TRUE),

-- MUNDO WELLNESS (4 niveles)
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 'Nivel 1: Bienestar Físico', 'Actividad física y descanso', 1, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', 'Nivel 2: Bienestar Mental', 'Salud mental y emocional', 2, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', 'Nivel 3: Bienestar Integral', 'Balance cuerpo-mente-espíritu', 3, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004', 'Nivel Dorado: Maestro del Wellness', 'Desafío dorado del bienestar', 4, TRUE, 18, TRUE),

-- MUNDO BEAUTY (4 niveles)
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', 'Nivel 1: Cuidado de la Piel', 'Rutinas básicas de skincare', 1, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', 'Nivel 2: Productos de Belleza', 'Cosméticos y maquillaje', 2, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', 'Nivel 3: Belleza Antiedad', 'Prevención y tratamientos', 3, FALSE, 9, TRUE),
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005', 'Nivel Dorado: Maestro de la Belleza', 'Desafío dorado de belleza', 4, TRUE, 18, TRUE);

-- ============================================================
-- MISIONES (3 por nivel = 60 misiones)
-- ============================================================

-- NIVEL 1 - FARMA: Fundamentos Farmacéuticos
INSERT INTO missions (id, level_id, name, description, order_num, max_stars, is_active) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Misión 1: ¿Qué es un Medicamento?', 'Descubre la definición y clasificación de medicamentos', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Misión 2: Formas Farmacéuticas', 'Conoce las diferentes presentaciones de medicamentos', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Misión 3: Administración Segura', 'Aprende cómo tomar medicamentos correctamente', 3, 3, TRUE),

-- NIVEL 2 - FARMA: Medicamentos Comunes
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Misión 1: Analgésicos', 'Medicamentos para el dolor', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Misión 2: Antibióticos', 'Combatiendo las infecciones', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'Misión 3: Antiinflamatorios', 'Reduciendo la inflamación', 3, 3, TRUE),

-- NIVEL 3 - FARMA: Interacciones Medicamentosas
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'Misión 1: Interacciones con Alimentos', 'Qué comer y qué evitar', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'Misión 2: Combinaciones Peligrosas', 'Medicamentos que no deben mezclarse', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'Misión 3: Efectos Secundarios', 'Reconociendo reacciones adversas', 3, 3, TRUE),

-- NIVEL 4 - FARMA: Nivel Dorado
('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'Misión 1: Desafío Dorado Farma A', 'Primera prueba del nivel dorado', 1, 6, TRUE),
('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', 'Misión 2: Desafío Dorado Farma B', 'Segunda prueba del nivel dorado', 2, 6, TRUE),
('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000004', 'Misión 3: Desafío Dorado Farma C', 'Tercera prueba del nivel dorado', 3, 6, TRUE),

-- NIVEL 1 - NUTRICIÓN: Nutrientes Esenciales
('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000005', 'Misión 1: Proteínas', 'El músculo de la nutrición', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000005', 'Misión 2: Carbohidratos', 'Energía para el cuerpo', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000005', 'Misión 3: Grasas Saludables', 'No todas las grasas son malas', 3, 3, TRUE),

-- NIVEL 2 - NUTRICIÓN: Dietas Saludables
('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000006', 'Misión 1: Dieta Mediterránea', 'El secreto de la longevidad', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000006', 'Misión 2: Alimentación Balanceada', 'El plato perfecto', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000006', 'Misión 3: Control de Porciones', 'Tamaño sí importa', 3, 3, TRUE),

-- NIVEL 3 - NUTRICIÓN: Suplementación Nutricional
('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000007', 'Misión 1: Vitaminas Esenciales', 'Micronutrientes clave', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000007', 'Misión 2: Minerales Importantes', 'Hierro, calcio y más', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000007', 'Misión 3: Suplementos Deportivos', 'Potencia tu rendimiento', 3, 3, TRUE),

-- NIVEL 4 - NUTRICIÓN: Nivel Dorado
('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000008', 'Misión 1: Desafío Dorado Nutrición A', 'Primera prueba del nivel dorado', 1, 6, TRUE),
('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000008', 'Misión 2: Desafío Dorado Nutrición B', 'Segunda prueba del nivel dorado', 2, 6, TRUE),
('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000008', 'Misión 3: Desafío Dorado Nutrición C', 'Tercera prueba del nivel dorado', 3, 6, TRUE),

-- NIVEL 1 - CONSUMO: Productos de Higiene
('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000009', 'Misión 1: Higiene Bucal', 'Sonrisa saludable', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000009', 'Misión 2: Cuidado del Cabello', 'Melena radiante', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000027', '20000000-0000-0000-0000-000000000009', 'Misión 3: Higiene Corporal', 'Limpieza diaria', 3, 3, TRUE),

-- NIVEL 2 - CONSUMO: Productos para el Hogar
('30000000-0000-0000-0000-000000000028', '20000000-0000-0000-0000-000000000010', 'Misión 1: Limpiadores Multiusos', 'Desinfección efectiva', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000029', '20000000-0000-0000-0000-000000000010', 'Misión 2: Productos Ecológicos', 'Limpieza verde', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000030', '20000000-0000-0000-0000-000000000010', 'Misión 3: Seguridad en el Hogar', 'Uso correcto de químicos', 3, 3, TRUE),

-- NIVEL 3 - CONSUMO: Consumo Responsable
('30000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000011', 'Misión 1: Lectura de Etiquetas', 'Información clave', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000032', '20000000-0000-0000-0000-000000000011', 'Misión 2: Productos Sostenibles', 'Compra consciente', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000011', 'Misión 3: Reducir, Reusar, Reciclar', 'Impacto ambiental', 3, 3, TRUE),

-- NIVEL 4 - CONSUMO: Nivel Dorado
('30000000-0000-0000-0000-000000000034', '20000000-0000-0000-0000-000000000012', 'Misión 1: Desafío Dorado Consumo A', 'Primera prueba del nivel dorado', 1, 6, TRUE),
('30000000-0000-0000-0000-000000000035', '20000000-0000-0000-0000-000000000012', 'Misión 2: Desafío Dorado Consumo B', 'Segunda prueba del nivel dorado', 2, 6, TRUE),
('30000000-0000-0000-0000-000000000036', '20000000-0000-0000-0000-000000000012', 'Misión 3: Desafío Dorado Consumo C', 'Tercera prueba del nivel dorado', 3, 6, TRUE),

-- NIVEL 1 - WELLNESS: Bienestar Físico
('30000000-0000-0000-0000-000000000037', '20000000-0000-0000-0000-000000000013', 'Misión 1: Ejercicio Regular', 'Muévete por tu salud', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000038', '20000000-0000-0000-0000-000000000013', 'Misión 2: Descanso Reparador', 'El poder del sueño', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000039', '20000000-0000-0000-0000-000000000013', 'Misión 3: Hidratación', 'Agua para la vida', 3, 3, TRUE),

-- NIVEL 2 - WELLNESS: Bienestar Mental
('30000000-0000-0000-0000-000000000040', '20000000-0000-0000-0000-000000000014', 'Misión 1: Manejo del Estrés', 'Calma tu mente', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000041', '20000000-0000-0000-0000-000000000014', 'Misión 2: Mindfulness', 'Atención plena', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000042', '20000000-0000-0000-0000-000000000014', 'Misión 3: Salud Emocional', 'Gestiona tus emociones', 3, 3, TRUE),

-- NIVEL 3 - WELLNESS: Bienestar Integral
('30000000-0000-0000-0000-000000000043', '20000000-0000-0000-0000-000000000015', 'Misión 1: Conexión Social', 'Relaciones saludables', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000044', '20000000-0000-0000-0000-000000000015', 'Misión 2: Propósito de Vida', 'Encuentra tu por qué', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000045', '20000000-0000-0000-0000-000000000015', 'Misión 3: Balance Vida-Trabajo', 'Equilibrio perfecto', 3, 3, TRUE),

-- NIVEL 4 - WELLNESS: Nivel Dorado
('30000000-0000-0000-0000-000000000046', '20000000-0000-0000-0000-000000000016', 'Misión 1: Desafío Dorado Wellness A', 'Primera prueba del nivel dorado', 1, 6, TRUE),
('30000000-0000-0000-0000-000000000047', '20000000-0000-0000-0000-000000000016', 'Misión 2: Desafío Dorado Wellness B', 'Segunda prueba del nivel dorado', 2, 6, TRUE),
('30000000-0000-0000-0000-000000000048', '20000000-0000-0000-0000-000000000016', 'Misión 3: Desafío Dorado Wellness C', 'Tercera prueba del nivel dorado', 3, 6, TRUE),

-- NIVEL 1 - BEAUTY: Cuidado de la Piel
('30000000-0000-0000-0000-000000000049', '20000000-0000-0000-0000-000000000017', 'Misión 1: Tipos de Piel', 'Conoce tu piel', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000050', '20000000-0000-0000-0000-000000000017', 'Misión 2: Rutina de Limpieza', 'Piel limpia y fresca', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000051', '20000000-0000-0000-0000-000000000017', 'Misión 3: Hidratación Facial', 'Hidrata tu rostro', 3, 3, TRUE),

-- NIVEL 2 - BEAUTY: Productos de Belleza
('30000000-0000-0000-0000-000000000052', '20000000-0000-0000-0000-000000000018', 'Misión 1: Maquillaje Básico', 'Realza tu belleza', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000053', '20000000-0000-0000-0000-000000000018', 'Misión 2: Cuidado del Contorno de Ojos', 'Mirada radiante', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000054', '20000000-0000-0000-0000-000000000018', 'Misión 3: Protección Solar', 'Cuida tu piel del sol', 3, 3, TRUE),

-- NIVEL 3 - BEAUTY: Belleza Antiedad
('30000000-0000-0000-0000-000000000055', '20000000-0000-0000-0000-000000000019', 'Misión 1: Prevención de Arrugas', 'Juventud duradera', 1, 3, TRUE),
('30000000-0000-0000-0000-000000000056', '20000000-0000-0000-0000-000000000019', 'Misión 2: Tratamientos Antiedad', 'Rejuvenecimiento efectivo', 2, 3, TRUE),
('30000000-0000-0000-0000-000000000057', '20000000-0000-0000-0000-000000000019', 'Misión 3: Ingredientes Activos', 'Retinol, ácido hialurónico y más', 3, 3, TRUE),

-- NIVEL 4 - BEAUTY: Nivel Dorado
('30000000-0000-0000-0000-000000000058', '20000000-0000-0000-0000-000000000020', 'Misión 1: Desafío Dorado Beauty A', 'Primera prueba del nivel dorado', 1, 6, TRUE),
('30000000-0000-0000-0000-000000000059', '20000000-0000-0000-0000-000000000020', 'Misión 2: Desafío Dorado Beauty B', 'Segunda prueba del nivel dorado', 2, 6, TRUE),
('30000000-0000-0000-0000-000000000060', '20000000-0000-0000-0000-000000000020', 'Misión 3: Desafío Dorado Beauty C', 'Tercera prueba del nivel dorado', 3, 6, TRUE);

-- ============================================================
-- ITEMS INFORMATIVOS DE MISIÓN (3 por misión = 180 items)
-- Solo mostraré ejemplos representativos por brevedad
-- En producción, se deben completar todos los 180 items
-- ============================================================

-- Misión 1: ¿Qué es un Medicamento?
INSERT INTO mission_items (id, mission_id, title, benefits, content_badges, detail, order_num) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Definición de Medicamento', 
 '<p>Los medicamentos son <strong>sustancias químicas</strong> diseñadas para prevenir, diagnosticar o tratar enfermedades.</p>',
 '[{"title": "Prevención"}, {"title": "Tratamiento"}, {"title": "Diagnóstico"}]',
 '<p>Un medicamento puede ser de origen natural o sintético. Su función principal es interactuar con el organismo para producir un efecto beneficioso en la salud.</p>', 1),

('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Clasificación de Medicamentos',
 '<p>Los medicamentos se clasifican por su <strong>uso terapéutico</strong>, forma farmacéutica y mecanismo de acción.</p>',
 '[{"title": "Analgésicos"}, {"title": "Antibióticos"}, {"title": "Antiinflamatorios"}]',
 '<p>La clasificación permite a los profesionales de la salud seleccionar el tratamiento más adecuado para cada condición médica.</p>', 2),

('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Importancia de la Prescripción',
 '<p>La <strong>prescripción médica</strong> es fundamental para garantizar el uso seguro y efectivo de medicamentos.</p>',
 '[{"title": "Seguridad"}, {"title": "Efectividad"}, {"title": "Dosificación"}]',
 '<p>Solo un profesional de la salud puede determinar qué medicamento, en qué dosis y por cuánto tiempo debe tomarse.</p>', 3);

-- Misión 2: Formas Farmacéuticas
INSERT INTO mission_items (id, mission_id, title, benefits, content_badges, detail, order_num) VALUES
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Tabletas y Cápsulas',
 '<p>Formas sólidas <strong>para administración oral</strong>, fáciles de dosificar y transportar.</p>',
 '[{"title": "Prácticas"}, {"title": "Dosificación exacta"}, {"title": "Estables"}]',
 '<p>Las tabletas pueden tener recubrimiento para facilitar la deglución o proteger el estómago. Las cápsulas contienen el medicamento en polvo o líquido.</p>', 1),

('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Jarabes y Soluciones',
 '<p>Formas líquidas ideales para <strong>niños y adultos</strong> con dificultad para tragar.</p>',
 '[{"title": "Fácil deglución"}, {"title": "Absorción rápida"}, {"title": "Ajuste de dosis"}]',
 '<p>Permiten ajustar la dosis con precisión y tienen un inicio de acción más rápido que las formas sólidas.</p>', 2),

('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Inyectables y Parches',
 '<p>Administración <strong>directa al torrente sanguíneo</strong> o a través de la piel.</p>',
 '[{"title": "Acción rápida"}, {"title": "Biodisponibilidad alta"}, {"title": "Liberación sostenida"}]',
 '<p>Los inyectables actúan inmediatamente, mientras los parches liberan el medicamento gradualmente durante horas o días.</p>', 3);

-- Continuación de items para otras misiones (simplificado por espacio)
-- En implementación real, se deben crear 180 items completos

-- Ejemplo de items para misiones de otros mundos
INSERT INTO mission_items (id, mission_id, title, benefits, content_badges, detail, order_num) VALUES
-- Nutrición - Misión 1: Proteínas
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', 'Proteínas Animales',
 '<p>Fuentes completas de <strong>aminoácidos esenciales</strong> para el crecimiento muscular.</p>',
 '[{"title": "Alto valor biológico"}, {"title": "Completas"}, {"title": "Biodisponibles"}]',
 '<p>Incluyen carne, pescado, huevos y lácteos. Proporcionan todos los aminoácidos que el cuerpo no puede producir.</p>', 1),

('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000013', 'Proteínas Vegetales',
 '<p>Opciones <strong>sostenibles y saludables</strong> provenientes de plantas.</p>',
 '[{"title": "Sin colesterol"}, {"title": "Ricas en fibra"}, {"title": "Sostenibles"}]',
 '<p>Legumbres, frutos secos, quinoa y soja son excelentes fuentes. Combinando diferentes fuentes se obtienen proteínas completas.</p>', 2),

('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000013', 'Necesidades Proteicas Diarias',
 '<p>La cantidad de proteína varía según <strong>edad, sexo y actividad física</strong>.</p>',
 '[{"title": "0.8-2g/kg"}, {"title": "Individual"}, {"title": "Variable"}]',
 '<p>Un adulto promedio necesita 0.8g de proteína por kg de peso corporal. Los deportistas pueden requerir hasta 2g/kg.</p>', 3);

-- Wellness - Misión 1: Ejercicio Regular
INSERT INTO mission_items (id, mission_id, title, benefits, content_badges, detail, order_num) VALUES
('40000000-0000-0000-0000-000000000037', '30000000-0000-0000-0000-000000000037', 'Beneficios del Ejercicio Aeróbico',
 '<p>Mejora la <strong>salud cardiovascular</strong> y aumenta la resistencia física.</p>',
 '[{"title": "Corazón fuerte"}, {"title": "Más energía"}, {"title": "Control de peso"}]',
 '<p>Caminar, correr, nadar o ciclismo son ejercicios aeróbicos que fortalecen el corazón y mejoran la circulación sanguínea.</p>', 1),

('40000000-0000-0000-0000-000000000038', '30000000-0000-0000-0000-000000000037', 'Entrenamiento de Fuerza',
 '<p>Desarrolla <strong>masa muscular</strong> y fortalece los huesos.</p>',
 '[{"title": "Músculos fuertes"}, {"title": "Huesos densos"}, {"title": "Metabolismo activo"}]',
 '<p>Levantar pesas, usar bandas elásticas o ejercicios con peso corporal ayudan a construir y mantener la masa muscular.</p>', 2),

('40000000-0000-0000-0000-000000000039', '30000000-0000-0000-0000-000000000037', 'Flexibilidad y Estiramiento',
 '<p>Mantiene las <strong>articulaciones móviles</strong> y previene lesiones.</p>',
 '[{"title": "Movilidad"}, {"title": "Prevención"}, {"title": "Relajación"}]',
 '<p>Yoga, pilates o estiramientos diarios mejoran la flexibilidad, reducen tensiones musculares y mejoran la postura.</p>', 3);

-- Beauty - Misión 1: Tipos de Piel
INSERT INTO mission_items (id, mission_id, title, benefits, content_badges, detail, order_num) VALUES
('40000000-0000-0000-0000-000000000049', '30000000-0000-0000-0000-000000000049', 'Piel Normal',
 '<p>Piel <strong>equilibrada</strong>, ni muy grasa ni muy seca.</p>',
 '[{"title": "Equilibrada"}, {"title": "Textura suave"}, {"title": "Poros pequeños"}]',
 '<p>Este tipo de piel tiene un equilibrio perfecto de hidratación y producción de sebo. Requiere cuidados básicos de mantenimiento.</p>', 1),

('40000000-0000-0000-0000-000000000050', '30000000-0000-0000-0000-000000000049', 'Piel Grasa',
 '<p>Producción <strong>excesiva de sebo</strong>, tendencia a brillos y acné.</p>',
 '[{"title": "Necesita limpieza"}, {"title": "Poros dilatados"}, {"title": "Tendencia acneica"}]',
 '<p>La piel grasa requiere productos oil-free y limpieza profunda. Evitar productos comedogénicos es fundamental.</p>', 2),

('40000000-0000-0000-0000-000000000051', '30000000-0000-0000-0000-000000000049', 'Piel Seca y Sensible',
 '<p>Falta de <strong>hidratación</strong> y mayor reactividad a irritantes.</p>',
 '[{"title": "Requiere hidratación"}, {"title": "Delicada"}, {"title": "Propensa a irritación"}]',
 '<p>La piel seca necesita cremas ricas en lípidos. La piel sensible requiere productos hipoalergénicos sin fragancias.</p>', 3);

-- ============================================================
-- PREGUNTAS (3 por misión = 180 preguntas)
-- Cada pregunta con 4 opciones (1 correcta basada en los items)
-- ============================================================

-- Preguntas para Misión 1: ¿Qué es un Medicamento?
INSERT INTO questions (id, mission_id, content, order_num, stars_value, is_active) VALUES
('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '¿Cuál es la función principal de un medicamento?', 1, 1, TRUE),
('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '¿Cómo se clasifican los medicamentos?', 2, 1, TRUE),
('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '¿Por qué es importante la prescripción médica?', 3, 1, TRUE);

-- Opciones para Pregunta 1
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Interactuar con el organismo para producir un efecto beneficioso en la salud', TRUE, 'Correcto. Los medicamentos previenen, diagnostican o tratan enfermedades mediante su interacción con el cuerpo.', 1),
('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Solo se usan para tratar enfermedades graves', FALSE, 'Incorrecto. Los medicamentos también se usan para prevención y diagnóstico, no solo para tratamiento.', 2),
('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Reemplazar completamente la función de un órgano', FALSE, 'Incorrecto. Los medicamentos apoyan y mejoran las funciones del organismo, pero raramente las reemplazan.', 3),
('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'Únicamente eliminar síntomas sin tratar la causa', FALSE, 'Incorrecto. Muchos medicamentos tratan la causa de la enfermedad, no solo los síntomas.', 4);

-- Opciones para Pregunta 2
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', 'Por su uso terapéutico, forma farmacéutica y mecanismo de acción', TRUE, 'Correcto. La clasificación permite seleccionar el tratamiento más adecuado para cada condición médica.', 1),
('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000002', 'Solo por su color y tamaño', FALSE, 'Incorrecto. El color y tamaño son características físicas, no criterios de clasificación terapéutica.', 2),
('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', 'Únicamente por su precio', FALSE, 'Incorrecto. El precio no es un criterio de clasificación médica de medicamentos.', 3),
('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000002', 'Por el país donde se fabrican', FALSE, 'Incorrecto. El origen geográfico no es un criterio de clasificación terapéutica.', 4);

-- Opciones para Pregunta 3
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000003', 'Garantiza el uso seguro y efectivo determinando qué medicamento, dosis y duración', TRUE, 'Correcto. Solo un profesional de la salud puede prescribir medicamentos de forma segura y efectiva.', 1),
('60000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000003', 'Es solo un requisito legal sin importancia médica', FALSE, 'Incorrecto. La prescripción tiene una importancia médica fundamental para la seguridad del paciente.', 2),
('60000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000003', 'Sirve únicamente para controlar el gasto en medicamentos', FALSE, 'Incorrecto. El propósito principal es la seguridad del paciente, no el control de costos.', 3),
('60000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000003', 'Cualquier persona puede recetar si conoce el medicamento', FALSE, 'Incorrecto. Solo profesionales de salud calificados pueden prescribir medicamentos.', 4);

-- Preguntas para Misión 2: Formas Farmacéuticas
INSERT INTO questions (id, mission_id, content, order_num, stars_value, is_active) VALUES
('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '¿Cuáles son las características de las tabletas y cápsulas?', 1, 1, TRUE),
('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '¿Para qué tipo de pacientes son ideales los jarabes?', 2, 1, TRUE),
('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', '¿Qué ventaja tienen los medicamentos inyectables?', 3, 1, TRUE);

-- Opciones para Pregunta 4
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000013', '50000000-0000-0000-0000-000000000004', 'Formas sólidas para administración oral, fáciles de dosificar y transportar', TRUE, 'Correcto. Las tabletas y cápsulas son prácticas, tienen dosificación exacta y son estables.', 1),
('60000000-0000-0000-0000-000000000014', '50000000-0000-0000-0000-000000000004', 'Solo se pueden usar de forma inyectable', FALSE, 'Incorrecto. Las tabletas y cápsulas son específicamente para uso oral.', 2),
('60000000-0000-0000-0000-000000000015', '50000000-0000-0000-0000-000000000004', 'Son líquidas y de rápida absorción', FALSE, 'Incorrecto. Las tabletas y cápsulas son formas sólidas, no líquidas.', 3),
('60000000-0000-0000-0000-000000000016', '50000000-0000-0000-0000-000000000004', 'Requieren refrigeración constante', FALSE, 'Incorrecto. La mayoría de tabletas y cápsulas son estables a temperatura ambiente.', 4);

-- Opciones para Pregunta 5
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000017', '50000000-0000-0000-0000-000000000005', 'Niños y adultos con dificultad para tragar', TRUE, 'Correcto. Los jarabes facilitan la deglución y permiten ajustar la dosis con precisión.', 1),
('60000000-0000-0000-0000-000000000018', '50000000-0000-0000-0000-000000000005', 'Solo para pacientes diabéticos', FALSE, 'Incorrecto. Los jarabes no son exclusivos para diabéticos, aunque existen versiones sin azúcar.', 2),
('60000000-0000-0000-0000-000000000019', '50000000-0000-0000-0000-000000000005', 'Únicamente para uso tópico', FALSE, 'Incorrecto. Los jarabes son para administración oral, no tópica.', 3),
('60000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000005', 'Solo para enfermedades crónicas', FALSE, 'Incorrecto. Los jarabes se usan para diversos tipos de tratamientos, no solo crónicos.', 4);

-- Opciones para Pregunta 6
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000006', 'Actúan inmediatamente con alta biodisponibilidad', TRUE, 'Correcto. Los inyectables llegan directamente al torrente sanguíneo para acción rápida.', 1),
('60000000-0000-0000-0000-000000000022', '50000000-0000-0000-0000-000000000006', 'Son más baratos que las tabletas', FALSE, 'Incorrecto. Generalmente los inyectables son más costosos por su fabricación y aplicación.', 2),
('60000000-0000-0000-0000-000000000023', '50000000-0000-0000-0000-000000000006', 'Se pueden autoadministrar sin supervisión', FALSE, 'Incorrecto. La mayoría de inyectables requieren administración por personal capacitado.', 3),
('60000000-0000-0000-0000-000000000024', '50000000-0000-0000-0000-000000000006', 'Tienen menos efectos secundarios', FALSE, 'Incorrecto. Los efectos secundarios dependen del medicamento, no de su forma de administración.', 4);

-- Continuación de preguntas para otras misiones (simplificado por espacio)
-- En producción real se deben crear las 180 preguntas completas con sus 720 opciones

-- Ejemplos adicionales de preguntas para otros mundos

-- Nutrición - Misión 1: Proteínas
INSERT INTO questions (id, mission_id, content, order_num, stars_value, is_active) VALUES
('50000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', '¿Qué caracteriza a las proteínas animales?', 1, 1, TRUE),
('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000013', '¿Cuál es un beneficio de las proteínas vegetales?', 2, 1, TRUE),
('50000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000013', '¿Cuánta proteína necesita un adulto promedio por kg de peso?', 3, 1, TRUE);

-- Opciones proteínas animales
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000037', '50000000-0000-0000-0000-000000000013', 'Son fuentes completas de aminoácidos esenciales con alto valor biológico', TRUE, 'Correcto. Las proteínas animales contienen todos los aminoácidos esenciales.', 1),
('60000000-0000-0000-0000-000000000038', '50000000-0000-0000-0000-000000000013', 'No contienen aminoácidos', FALSE, 'Incorrecto. Las proteínas animales son ricas en aminoácidos esenciales.', 2),
('60000000-0000-0000-0000-000000000039', '50000000-0000-0000-0000-000000000013', 'Solo provienen de plantas', FALSE, 'Incorrecto. Las proteínas animales provienen de carne, pescado, huevos y lácteos.', 3),
('60000000-0000-0000-0000-000000000040', '50000000-0000-0000-0000-000000000013', 'Son bajas en calorías', FALSE, 'Incorrecto. El contenido calórico varía según el tipo de proteína animal.', 4);

-- Wellness - Misión 1: Ejercicio Regular
INSERT INTO questions (id, mission_id, content, order_num, stars_value, is_active) VALUES
('50000000-0000-0000-0000-000000000037', '30000000-0000-0000-0000-000000000037', '¿Qué beneficio aporta el ejercicio aeróbico?', 1, 1, TRUE),
('50000000-0000-0000-0000-000000000038', '30000000-0000-0000-0000-000000000037', '¿Para qué sirve el entrenamiento de fuerza?', 2, 1, TRUE),
('50000000-0000-0000-0000-000000000039', '30000000-0000-0000-0000-000000000037', '¿Qué mejora la flexibilidad y el estiramiento?', 3, 1, TRUE);

-- Opciones ejercicio aeróbico
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000109', '50000000-0000-0000-0000-000000000037', 'Mejora la salud cardiovascular y aumenta la resistencia física', TRUE, 'Correcto. El ejercicio aeróbico fortalece el corazón y mejora la circulación.', 1),
('60000000-0000-0000-0000-000000000110', '50000000-0000-0000-0000-000000000037', 'Solo sirve para perder peso', FALSE, 'Incorrecto. El ejercicio aeróbico tiene múltiples beneficios además de la pérdida de peso.', 2),
('60000000-0000-0000-0000-000000000111', '50000000-0000-0000-0000-000000000037', 'Debilita los músculos', FALSE, 'Incorrecto. El ejercicio aeróbico fortalece tanto el corazón como los músculos.', 3),
('60000000-0000-0000-0000-000000000112', '50000000-0000-0000-0000-000000000037', 'Es peligroso para la salud', FALSE, 'Incorrecto. El ejercicio aeróbico regular es fundamental para la salud.', 4);

-- Beauty - Misión 1: Tipos de Piel
INSERT INTO questions (id, mission_id, content, order_num, stars_value, is_active) VALUES
('50000000-0000-0000-0000-000000000049', '30000000-0000-0000-0000-000000000049', '¿Cómo se caracteriza la piel normal?', 1, 1, TRUE),
('50000000-0000-0000-0000-000000000050', '30000000-0000-0000-0000-000000000049', '¿Qué caracteriza a la piel grasa?', 2, 1, TRUE),
('50000000-0000-0000-0000-000000000051', '30000000-0000-0000-0000-000000000049', '¿Qué necesita la piel seca?', 3, 1, TRUE);

-- Opciones piel normal
INSERT INTO answer_options (id, question_id, text, is_correct, detail, order_num) VALUES
('60000000-0000-0000-0000-000000000145', '50000000-0000-0000-0000-000000000049', 'Es equilibrada, ni muy grasa ni muy seca, con textura suave', TRUE, 'Correcto. La piel normal tiene un equilibrio perfecto de hidratación y producción de sebo.', 1),
('60000000-0000-0000-0000-000000000146', '50000000-0000-0000-0000-000000000049', 'Tiene exceso de grasa y poros dilatados', FALSE, 'Incorrecto. Esto caracteriza a la piel grasa, no a la piel normal.', 2),
('60000000-0000-0000-0000-000000000147', '50000000-0000-0000-0000-000000000049', 'Es muy seca y áspera', FALSE, 'Incorrecto. Esto caracteriza a la piel seca, no a la piel normal.', 3),
('60000000-0000-0000-0000-000000000148', '50000000-0000-0000-0000-000000000049', 'Presenta irritación constante', FALSE, 'Incorrecto. La irritación constante caracteriza a la piel sensible, no a la normal.', 4);

-- ============================================================
-- NOTA IMPORTANTE
-- ============================================================
-- Este archivo contiene EJEMPLOS representativos de cada tipo de contenido.
-- En una implementación de producción completa, se deben crear:
-- - 60 misiones completas (20 niveles x 3 misiones)
-- - 180 items informativos (60 misiones x 3 items)
-- - 180 preguntas (60 misiones x 3 preguntas)
-- - 720 opciones de respuesta (180 preguntas x 4 opciones)
--
-- Los datos mostrados aquí sirven como plantilla para completar
-- el contenido restante siguiendo la misma estructura.
-- ============================================================

-- Verificación de datos insertados
SELECT 
  (SELECT COUNT(*) FROM worlds) AS total_worlds,
  (SELECT COUNT(*) FROM levels) AS total_levels,
  (SELECT COUNT(*) FROM missions) AS total_missions,
  (SELECT COUNT(*) FROM mission_items) AS total_items,
  (SELECT COUNT(*) FROM questions) AS total_questions,
  (SELECT COUNT(*) FROM answer_options) AS total_options;
