-- ============================================================
-- FARMATOUR5 - Schema PostgreSQL
-- Versión: 1.0
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('manager', 'reporter');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document');
CREATE TYPE log_action AS ENUM (
  'login', 'logout',
  'mission_view', 'mission_complete',
  'level_complete', 'world_complete',
  'exam_start', 'exam_complete',
  'golden_level_complete'
);

-- ============================================================
-- USUARIOS DE SISTEMA
-- ============================================================
CREATE TABLE system_users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username    VARCHAR(100) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(255),
  role        user_role NOT NULL DEFAULT 'reporter',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usuarios iniciales (contraseña: Admin1234! hasheada con bcrypt)
INSERT INTO system_users (username, email, password, full_name, role)
VALUES
  ('admin', 'admin@farmatour5.com', '$2a$10$gykqXHRaLoj5ll5xhq1KQeeJugR.uBEMtw1PiXGF3IL4qHPyLgk3u', 'Administrador Principal', 'manager'),
  ('reporter', 'reporter@farmatour5.com', '$2a$10$gykqXHRaLoj5ll5xhq1KQeeJugR.uBEMtw1PiXGF3IL4qHPyLgk3u', 'Reporter Inicial', 'reporter');

-- ============================================================
-- GRUPOS DE PARTICIPANTES
-- ============================================================
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTICIPANTES
-- ============================================================
CREATE TABLE participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni         VARCHAR(20) NOT NULL UNIQUE,
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255),
  group_id    UUID REFERENCES groups(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  total_stars INTEGER NOT NULL DEFAULT 0,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participants_dni ON participants(dni);
CREATE INDEX idx_participants_group ON participants(group_id);
CREATE INDEX idx_participants_stars ON participants(total_stars DESC);

-- ============================================================
-- BIBLIOTECA DE MEDIOS
-- ============================================================
CREATE TABLE media_library (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  type        media_type NOT NULL,
  url         VARCHAR(500) NOT NULL,
  file_size   BIGINT,
  mime_type   VARCHAR(100),
  width       INTEGER,
  height      INTEGER,
  duration    INTEGER,
  tags        TEXT[],
  uploaded_by UUID REFERENCES system_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_type ON media_library(type);

-- ============================================================
-- MUNDOS
-- ============================================================
CREATE TABLE worlds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num   INTEGER NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_worlds_order ON worlds(order_num);

-- ============================================================
-- NIVELES
-- ============================================================
CREATE TABLE levels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id    UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num   INTEGER NOT NULL,
  is_golden   BOOLEAN NOT NULL DEFAULT FALSE,
  max_stars   INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_levels_world ON levels(world_id);
CREATE UNIQUE INDEX idx_levels_world_order ON levels(world_id, order_num);

-- ============================================================
-- MISIONES
-- ============================================================
CREATE TABLE missions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id    UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num   INTEGER NOT NULL,
  max_stars   INTEGER NOT NULL DEFAULT 3,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_missions_level ON missions(level_id);
CREATE UNIQUE INDEX idx_missions_level_order ON missions(level_id, order_num);

-- ============================================================
-- ITEMS DE INFORMACIÓN DE MISIÓN
-- ============================================================
CREATE TABLE mission_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  image_id        UUID REFERENCES media_library(id) ON DELETE SET NULL,
  thumbnail_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  benefits        TEXT,
  content_badges  JSONB DEFAULT '[]',
  detail          TEXT,
  order_num       INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mission_items_mission ON mission_items(mission_id);

-- ============================================================
-- PREGUNTAS
-- ============================================================
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num   INTEGER NOT NULL,
  stars_value INTEGER NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_mission ON questions(mission_id);

-- ============================================================
-- OPCIONES DE RESPUESTA
-- ============================================================
CREATE TABLE answer_options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  detail      TEXT,
  order_num   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answer_options_question ON answer_options(question_id);

-- ============================================================
-- EVALUACIONES DE NIVEL (EXAMEN FINAL)
-- ============================================================
CREATE TABLE level_exams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id    UUID NOT NULL UNIQUE REFERENCES levels(id) ON DELETE CASCADE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE level_exam_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_exam_id   UUID NOT NULL REFERENCES level_exams(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  image_id        UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num       INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE level_exam_options (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_question_id UUID NOT NULL REFERENCES level_exam_questions(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  image_id        UUID REFERENCES media_library(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  detail          TEXT,
  order_num       INTEGER NOT NULL
);

-- ============================================================
-- EVALUACIONES DE MUNDO
-- ============================================================
CREATE TABLE world_exams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id    UUID NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE world_exam_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_exam_id UUID NOT NULL REFERENCES world_exams(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  image_id      UUID REFERENCES media_library(id) ON DELETE SET NULL,
  order_num     INTEGER NOT NULL,
  stars_3       INTEGER NOT NULL DEFAULT 10,
  stars_2       INTEGER NOT NULL DEFAULT 5,
  stars_1       INTEGER NOT NULL DEFAULT 3,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE world_exam_options (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_question_id UUID NOT NULL REFERENCES world_exam_questions(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  image_id        UUID REFERENCES media_library(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  detail          TEXT,
  order_num       INTEGER NOT NULL
);

-- ============================================================
-- PROGRESO DE PARTICIPANTES - MISIONES
-- ============================================================
CREATE TABLE participant_mission_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(participant_id, mission_id)
);

CREATE INDEX idx_mission_progress_participant ON participant_mission_progress(participant_id);
CREATE INDEX idx_mission_progress_mission ON participant_mission_progress(mission_id);

-- ============================================================
-- RESPUESTAS DE PARTICIPANTES
-- ============================================================
CREATE TABLE participant_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_id       UUID REFERENCES answer_options(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

CREATE INDEX idx_participant_answers_participant ON participant_answers(participant_id);

-- ============================================================
-- PROGRESO DE PARTICIPANTES - NIVELES
-- ============================================================
CREATE TABLE participant_level_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  level_id        UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(participant_id, level_id)
);

CREATE INDEX idx_level_progress_participant ON participant_level_progress(participant_id);

-- ============================================================
-- PROGRESO DE PARTICIPANTES - MUNDOS
-- ============================================================
CREATE TABLE participant_world_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  world_id        UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(participant_id, world_id)
);

CREATE INDEX idx_world_progress_participant ON participant_world_progress(participant_id);

-- ============================================================
-- RESPUESTAS EXÁMENES DE NIVEL
-- ============================================================
CREATE TABLE participant_level_exam_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  exam_question_id UUID NOT NULL REFERENCES level_exam_questions(id) ON DELETE CASCADE,
  answer_id       UUID REFERENCES level_exam_options(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, exam_question_id)
);

-- ============================================================
-- RESPUESTAS EXÁMENES DE MUNDO
-- ============================================================
CREATE TABLE participant_world_exam_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  exam_question_id UUID NOT NULL REFERENCES world_exam_questions(id) ON DELETE CASCADE,
  answer_id       UUID REFERENCES world_exam_options(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, exam_question_id)
);

-- ============================================================
-- LOG DE ACTIVIDAD DE PARTICIPANTES
-- ============================================================
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID REFERENCES participants(id) ON DELETE SET NULL,
  action          log_action NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  metadata        JSONB DEFAULT '{}',
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_participant ON activity_logs(participant_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================================
-- LOG DE VISITAS AL PORTAL (administradores)
-- ============================================================
CREATE TABLE admin_access_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES system_users(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,
  resource      VARCHAR(100),
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_user ON admin_access_logs(user_id);

-- ============================================================
-- CONFIGURACIONES DEL SISTEMA
-- ============================================================
CREATE TABLE system_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         VARCHAR(100) NOT NULL UNIQUE,
  value       TEXT,
  description TEXT,
  updated_by  UUID REFERENCES system_users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configuraciones iniciales
INSERT INTO system_config (key, value, description) VALUES
  ('gift_countdown_minutes', '60', 'Minutos para el contador del regalo'),
  ('gift_message', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Mensaje del regalo cuando el contador llega a cero'),
  ('bg_sound_enabled', 'true', 'Sonido de fondo habilitado por defecto'),
  ('effect_sound_enabled', 'true', 'Sonido de efectos habilitado por defecto'),
  ('max_participants', '20000', 'Cantidad máxima de participantes'),
  ('site_name', 'Farmatour 5', 'Nombre del sitio'),
  ('maintenance_mode', 'false', 'Modo mantenimiento');

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Ranking general
CREATE VIEW v_participant_ranking AS
SELECT
  p.id,
  p.full_name,
  p.dni,
  p.total_stars,
  g.name AS group_name,
  g.id   AS group_id,
  RANK() OVER (ORDER BY p.total_stars DESC) AS global_rank
FROM participants p
LEFT JOIN groups g ON g.id = p.group_id
WHERE p.is_active = TRUE;

-- Ranking por grupo
CREATE VIEW v_group_ranking AS
SELECT
  g.id AS group_id,
  g.name AS group_name,
  COUNT(p.id) AS participant_count,
  COALESCE(SUM(p.total_stars), 0) AS total_group_stars,
  RANK() OVER (ORDER BY COALESCE(SUM(p.total_stars), 0) DESC) AS group_rank
FROM groups g
LEFT JOIN participants p ON p.group_id = g.id AND p.is_active = TRUE
GROUP BY g.id, g.name;

-- Top 10 participantes
CREATE VIEW v_top10_participants AS
SELECT * FROM v_participant_ranking LIMIT 10;

-- Top 10 grupos
CREATE VIEW v_top10_groups AS
SELECT * FROM v_group_ranking LIMIT 10;

-- Progreso general participantes
CREATE VIEW v_participant_summary AS
SELECT
  p.id,
  p.full_name,
  p.dni,
  p.total_stars,
  p.last_login,
  g.name AS group_name,
  (SELECT COUNT(*) FROM participant_mission_progress pmp WHERE pmp.participant_id = p.id AND pmp.is_completed) AS missions_completed,
  (SELECT COUNT(*) FROM participant_level_progress plp WHERE plp.participant_id = p.id AND plp.is_completed) AS levels_completed,
  (SELECT COUNT(*) FROM participant_world_progress pwp WHERE pwp.participant_id = p.id AND pwp.is_completed) AS worlds_completed
FROM participants p
LEFT JOIN groups g ON g.id = p.group_id
WHERE p.is_active = TRUE;

-- ============================================================
-- FUNCIONES
-- ============================================================

-- Función para actualizar total_stars del participante
CREATE OR REPLACE FUNCTION fn_update_participant_stars(p_participant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE participants
  SET total_stars = (
    SELECT COALESCE(SUM(stars_earned), 0)
    FROM participant_mission_progress
    WHERE participant_id = p_participant_id
  ) + (
    SELECT COALESCE(SUM(stars_earned), 0)
    FROM participant_world_exam_answers
    WHERE participant_id = p_participant_id
  )
  WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stars al completar misión
CREATE OR REPLACE FUNCTION trg_update_stars()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM fn_update_participant_stars(NEW.participant_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_mission_progress_update
  AFTER INSERT OR UPDATE ON participant_mission_progress
  FOR EACH ROW EXECUTE FUNCTION trg_update_stars();

CREATE TRIGGER after_world_exam_answer
  AFTER INSERT OR UPDATE ON participant_world_exam_answers
  FOR EACH ROW EXECUTE FUNCTION trg_update_stars();

-- Función para calcular puesto en grupo
CREATE OR REPLACE FUNCTION fn_group_rank(p_participant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
  v_group_id UUID;
BEGIN
  SELECT group_id INTO v_group_id FROM participants WHERE id = p_participant_id;
  IF v_group_id IS NULL THEN RETURN 0; END IF;
  SELECT rank INTO v_rank FROM (
    SELECT id, RANK() OVER (ORDER BY total_stars DESC) AS rank
    FROM participants
    WHERE group_id = v_group_id AND is_active = TRUE
  ) r WHERE id = p_participant_id;
  RETURN COALESCE(v_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ÍNDICES ADICIONALES DE PERFORMANCE
-- ============================================================
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_participants_active ON participants(is_active);
CREATE INDEX idx_worlds_active_order ON worlds(is_active, order_num);
CREATE INDEX idx_levels_active ON levels(is_active, world_id, order_num);
CREATE INDEX idx_missions_active ON missions(is_active, level_id, order_num);
