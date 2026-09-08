-- ============================================================
-- MIGRACIÓN 002: Agregar soporte para 3 tipos de niveles
-- Nivel Normal, Nivel Dorado (Golden), Nivel Final
-- ============================================================

-- 1. Crear ENUM para tipos de nivel (si no existe)
DO $$ BEGIN
  CREATE TYPE level_type AS ENUM ('normal', 'golden', 'final');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar columnas a la tabla levels (si no existen)
DO $$ BEGIN
  ALTER TABLE levels ADD COLUMN level_type level_type NOT NULL DEFAULT 'normal';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE levels ADD COLUMN intro_video_url VARCHAR(500);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE levels ADD COLUMN intro_video_id UUID REFERENCES media_library(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- 3. Crear tabla para items de contenido de niveles dorados
-- Los niveles dorados no tienen misiones, solo items de contenido
CREATE TABLE IF NOT EXISTS golden_level_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id        UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  detail          TEXT,
  order_num       INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_golden_level_items_level ON golden_level_items(level_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_golden_level_items_level_order ON golden_level_items(level_id, order_num);

-- 4. Crear tabla para preguntas de niveles dorados
-- Los niveles dorados tienen preguntas después de los items de contenido
CREATE TABLE IF NOT EXISTS golden_level_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id    UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  order_num   INTEGER NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_golden_level_questions_level ON golden_level_questions(level_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_golden_level_questions_level_order ON golden_level_questions(level_id, order_num);

-- 5. Crear tabla para opciones de respuesta de preguntas de niveles dorados
-- Solo texto, sin imágenes
CREATE TABLE IF NOT EXISTS golden_level_answer_options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES golden_level_questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  order_num   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_golden_level_answer_options_question ON golden_level_answer_options(question_id);

-- 6. Crear tabla para preguntas de niveles finales
-- Los niveles finales solo tienen preguntas con videos
CREATE TABLE IF NOT EXISTS final_level_questions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id                UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  content                 TEXT NOT NULL,
  start_video_url         VARCHAR(500),
  start_video_id          UUID REFERENCES media_library(id) ON DELETE SET NULL,
  end_video_url           VARCHAR(500),
  end_video_id            UUID REFERENCES media_library(id) ON DELETE SET NULL,
  correct_message         TEXT,
  incorrect_message       TEXT,
  order_num               INTEGER NOT NULL,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_final_level_questions_level ON final_level_questions(level_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_final_level_questions_level_order ON final_level_questions(level_id, order_num);

-- 7. Crear tabla para opciones de respuesta de preguntas de niveles finales
-- Imagen y texto, igual que preguntas de misiones
CREATE TABLE IF NOT EXISTS final_level_answer_options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES final_level_questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  image_id    UUID REFERENCES media_library(id) ON DELETE SET NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  order_num   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_final_level_answer_options_question ON final_level_answer_options(question_id);

-- 8. Crear tabla para respuestas de participantes en niveles dorados
CREATE TABLE IF NOT EXISTS participant_golden_level_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES golden_level_questions(id) ON DELETE CASCADE,
  answer_id       UUID REFERENCES golden_level_answer_options(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_golden_answers_participant ON participant_golden_level_answers(participant_id);

-- 9. Crear tabla para respuestas de participantes en niveles finales
CREATE TABLE IF NOT EXISTS participant_final_level_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES final_level_questions(id) ON DELETE CASCADE,
  answer_id       UUID REFERENCES final_level_answer_options(id) ON DELETE SET NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_final_answers_participant ON participant_final_level_answers(participant_id);

-- 10. Crear tabla para progreso de participantes en niveles dorados
CREATE TABLE IF NOT EXISTS participant_golden_level_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  level_id        UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(participant_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_golden_progress_participant ON participant_golden_level_progress(participant_id);

-- 11. Crear tabla para progreso de participantes en niveles finales
CREATE TABLE IF NOT EXISTS participant_final_level_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  level_id        UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(participant_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_final_progress_participant ON participant_final_level_progress(participant_id);

-- Actualizar log_action ENUM para agregar nuevas acciones
DO $$ BEGIN
  ALTER TYPE log_action ADD VALUE 'golden_level_complete';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE log_action ADD VALUE 'final_level_complete';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- Comentarios de documentación
-- ============================================================
COMMENT ON TABLE IF EXISTS golden_level_items IS 'Items de contenido para niveles dorados - contienen título y detalle';
COMMENT ON TABLE IF EXISTS golden_level_questions IS 'Preguntas para evaluación de niveles dorados - solo texto en opciones';
COMMENT ON TABLE IF EXISTS final_level_questions IS 'Preguntas para niveles finales - con videos de inicio y cierre';
COMMENT ON COLUMN IF EXISTS levels.level_type IS 'Tipo de nivel: normal (con misiones), golden (sin misiones, solo contenido), final (solo preguntas)';
COMMENT ON COLUMN IF EXISTS levels.intro_video_url IS 'URL del video introductorio (usado en niveles finales)';
