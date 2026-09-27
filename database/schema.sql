-- Adminer 6.0.1 PostgreSQL 15.19 dump

DROP VIEW IF EXISTS "public"."v_group_ranking", "public"."v_participant_ranking", "public"."v_participant_summary", "public"."v_top10_groups", "public"."v_top10_participants";
DROP TABLE IF EXISTS "public"."activity_logs", "public"."admin_access_logs", "public"."answer_options", "public"."final_level_answer_options", "public"."final_level_questions", "public"."golden_level_answer_options", "public"."golden_level_items", "public"."golden_level_questions", "public"."groups", "public"."level_exam_options", "public"."level_exam_questions", "public"."level_exams", "public"."levels", "public"."media_library", "public"."mission_items", "public"."missions", "public"."participant_answers", "public"."participant_final_level_answers", "public"."participant_final_level_progress", "public"."participant_golden_level_answers", "public"."participant_golden_level_progress", "public"."participant_level_exam_answers", "public"."participant_level_progress", "public"."participant_mission_progress", "public"."participant_world_exam_answers", "public"."participant_world_progress", "public"."participants", "public"."questions", "public"."system_config", "public"."system_users", "public"."world_exam_options", "public"."world_exam_questions", "public"."world_exams", "public"."worlds";

CREATE TABLE "public"."activity_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid,
    "action" log_action NOT NULL,
    "entity_type" character varying(50),
    "entity_id" uuid,
    "metadata" jsonb DEFAULT '{}',
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at DESC);

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);

CREATE INDEX idx_activity_logs_participant ON public.activity_logs USING btree (participant_id);


CREATE TABLE "public"."admin_access_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "action" character varying(100) NOT NULL,
    "resource" character varying(100),
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "admin_access_logs_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_admin_logs_user ON public.admin_access_logs USING btree (user_id);


CREATE TABLE "public"."answer_options" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "question_id" uuid NOT NULL,
    "text" text NOT NULL,
    "image_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "detail" text,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_answer_options_question ON public.answer_options USING btree (question_id);


CREATE TABLE "public"."final_level_answer_options" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "question_id" uuid NOT NULL,
    "text" text NOT NULL,
    "image_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "final_level_answer_options_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_final_level_answer_options_question ON public.final_level_answer_options USING btree (question_id);


CREATE TABLE "public"."final_level_questions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_id" uuid NOT NULL,
    "content" text NOT NULL,
    "start_video_url" character varying(500),
    "start_video_id" uuid,
    "end_video_url" character varying(500),
    "end_video_id" uuid,
    "correct_message" text,
    "incorrect_message" text,
    "order_num" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "final_level_questions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

COMMENT ON TABLE "public"."final_level_questions" IS 'Preguntas para niveles finales - con videos de inicio y cierre';

CREATE INDEX idx_final_level_questions_level ON public.final_level_questions USING btree (level_id);

CREATE UNIQUE INDEX idx_final_level_questions_level_order ON public.final_level_questions USING btree (level_id, order_num);


CREATE TABLE "public"."golden_level_answer_options" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "question_id" uuid NOT NULL,
    "text" text NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "golden_level_answer_options_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_golden_level_answer_options_question ON public.golden_level_answer_options USING btree (question_id);


CREATE TABLE "public"."golden_level_items" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_id" uuid NOT NULL,
    "title" character varying(255) NOT NULL,
    "detail" text,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "golden_level_items_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

COMMENT ON TABLE "public"."golden_level_items" IS 'Items de contenido para niveles dorados - contienen título y detalle';

CREATE INDEX idx_golden_level_items_level ON public.golden_level_items USING btree (level_id);

CREATE UNIQUE INDEX idx_golden_level_items_level_order ON public.golden_level_items USING btree (level_id, order_num);


CREATE TABLE "public"."golden_level_questions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_id" uuid NOT NULL,
    "content" text NOT NULL,
    "order_num" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "golden_level_questions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

COMMENT ON TABLE "public"."golden_level_questions" IS 'Preguntas para evaluación de niveles dorados - solo texto en opciones';

CREATE INDEX idx_golden_level_questions_level ON public.golden_level_questions USING btree (level_id);

CREATE UNIQUE INDEX idx_golden_level_questions_level_order ON public.golden_level_questions USING btree (level_id, order_num);


CREATE TABLE "public"."groups" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


CREATE TABLE "public"."level_exam_options" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "exam_question_id" uuid NOT NULL,
    "text" text NOT NULL,
    "image_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "detail" text,
    "order_num" integer NOT NULL,
    CONSTRAINT "level_exam_options_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


CREATE TABLE "public"."level_exam_questions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_exam_id" uuid NOT NULL,
    "content" text NOT NULL,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "level_exam_questions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


CREATE TABLE "public"."level_exams" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_id" uuid NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "level_exams_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX level_exams_level_id_key ON public.level_exams USING btree (level_id);


CREATE TABLE "public"."levels" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "world_id" uuid NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" text,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "is_golden" boolean DEFAULT false NOT NULL,
    "max_stars" integer DEFAULT '0' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    "level_type" level_type DEFAULT normal NOT NULL,
    "intro_video_url" character varying(500),
    "intro_video_id" uuid,
    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

COMMENT ON COLUMN "public"."levels"."level_type" IS 'Tipo de nivel: normal (con misiones), golden (sin misiones, solo contenido), final (solo preguntas)';

COMMENT ON COLUMN "public"."levels"."intro_video_url" IS 'URL del video introductorio (usado en niveles finales)';

CREATE INDEX idx_levels_active ON public.levels USING btree (is_active, world_id, order_num);

CREATE INDEX idx_levels_world ON public.levels USING btree (world_id);

CREATE UNIQUE INDEX idx_levels_world_order ON public.levels USING btree (world_id, order_num);


CREATE TABLE "public"."media_library" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" character varying(255) NOT NULL,
    "type" media_type NOT NULL,
    "url" character varying(500) NOT NULL,
    "file_size" bigint,
    "mime_type" character varying(100),
    "width" integer,
    "height" integer,
    "duration" integer,
    "tags" text[],
    "uploaded_by" uuid,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_media_type ON public.media_library USING btree (type);


CREATE TABLE "public"."mission_items" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "mission_id" uuid NOT NULL,
    "title" character varying(255) NOT NULL,
    "image_id" uuid,
    "thumbnail_id" uuid,
    "benefits" text,
    "content_badges" jsonb DEFAULT '[]',
    "detail" text,
    "order_num" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "mission_items_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_mission_items_mission ON public.mission_items USING btree (mission_id);


CREATE TABLE "public"."missions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level_id" uuid NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" text,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "max_stars" integer DEFAULT '3' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_missions_active ON public.missions USING btree (is_active, level_id, order_num);

CREATE INDEX idx_missions_level ON public.missions USING btree (level_id);

CREATE UNIQUE INDEX idx_missions_level_order ON public.missions USING btree (level_id, order_num);

INSERT INTO "missions" ("id", "level_id", "name", "description", "image_id", "order_num", "max_stars", "is_active", "created_at", "updated_at") VALUES
('b6560aa2-f610-40fd-be36-c83348308ac9',	'20000001-0000-0000-0000-000000000000',	'Nicel 1 - Mision 1 ',	NULL,	'c3080a6b-ebbc-4729-ad7d-61aae10e50ad',	1,	3,	't',	'2026-09-04 19:16:26.262242+00',	'2026-09-04 19:16:26.262242+00'),
('7fd075ba-0dd2-415b-89b2-53c98a564617',	'20000001-0000-0000-0000-000000000000',	'Nivel 1 - Mision 2',	NULL,	'81755fb5-9edf-4389-b060-a7f9b6ff681d',	2,	3,	't',	'2026-09-04 19:16:42.043397+00',	'2026-09-04 19:17:41.510196+00'),
('a536a5ca-ec32-4f50-8760-abf975578f93',	'20000001-0000-0000-0000-000000000000',	'Nivel 1 - Mision 3',	NULL,	'cd938867-a5eb-48f5-a45b-deaed387db5f',	3,	3,	't',	'2026-09-04 19:17:52.811402+00',	'2026-09-04 19:17:52.811402+00'),
('30000011-0000-0000-0000-000000000000',	'20000006-0000-0000-0000-000000000000',	'Misión 1: Proteínas y Grasas',	'Macronutrientes esenciales',	'4891df8a-7353-4399-8c14-c3a55e2a738f',	1,	3,	't',	'2026-09-05 01:00:00.123177+00',	'2026-09-05 01:00:00.123177+00'),
('30000012-0000-0000-0000-000000000000',	'20000006-0000-0000-0000-000000000000',	'Misión 2: Carbohidratos y Fibra',	'Energía y digestión',	'81755fb5-9edf-4389-b060-a7f9b6ff681d',	2,	3,	't',	'2026-09-05 01:00:00.123177+00',	'2026-09-05 01:00:00.123177+00'),
('30000013-0000-0000-0000-000000000000',	'20000006-0000-0000-0000-000000000000',	'Misión 3: Agua y Hidratación',	'Vital para el cuerpo',	'cd938867-a5eb-48f5-a45b-deaed387db5f',	3,	3,	't',	'2026-09-05 01:00:00.123177+00',	'2026-09-05 01:00:00.123177+00'),
('30000021-0000-0000-0000-000000000000',	'20000011-0000-0000-0000-000000000000',	'Misión 1: Beneficios del Ejercicio',	'Movimiento y salud',	'4891df8a-7353-4399-8c14-c3a55e2a738f',	1,	3,	't',	'2026-09-05 01:00:00.360877+00',	'2026-09-05 01:00:00.360877+00'),
('30000022-0000-0000-0000-000000000000',	'20000011-0000-0000-0000-000000000000',	'Misión 2: Tipos de Ejercicio',	'Cardio, fuerza y flexibilidad',	'81755fb5-9edf-4389-b060-a7f9b6ff681d',	2,	3,	't',	'2026-09-05 01:00:00.360877+00',	'2026-09-05 01:00:00.360877+00'),
('30000023-0000-0000-0000-000000000000',	'20000011-0000-0000-0000-000000000000',	'Misión 3: Seguridad en Ejercicio',	'Prevenir lesiones',	'cd938867-a5eb-48f5-a45b-deaed387db5f',	3,	3,	't',	'2026-09-05 01:00:00.360877+00',	'2026-09-05 01:00:00.360877+00'),
('30000031-0000-0000-0000-000000000000',	'20000016-0000-0000-0000-000000000000',	'Misión 1: Tipos de Piel',	'Conocer tu piel',	'4891df8a-7353-4399-8c14-c3a55e2a738f',	1,	3,	't',	'2026-09-05 01:00:00.50433+00',	'2026-09-05 01:00:00.50433+00'),
('30000032-0000-0000-0000-000000000000',	'20000016-0000-0000-0000-000000000000',	'Misión 2: Rutina Básica',	'Limpieza y cuidado',	'81755fb5-9edf-4389-b060-a7f9b6ff681d',	2,	3,	't',	'2026-09-05 01:00:00.50433+00',	'2026-09-05 01:00:00.50433+00'),
('30000033-0000-0000-0000-000000000000',	'20000016-0000-0000-0000-000000000000',	'Misión 3: Protección Solar',	'Prevención de daño',	'cd938867-a5eb-48f5-a45b-deaed387db5f',	3,	3,	't',	'2026-09-05 01:00:00.50433+00',	'2026-09-05 01:00:00.50433+00');

CREATE TABLE "public"."participant_answers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "answer_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "answered_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participant_answers_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_answers_participant_id_question_id_key ON public.participant_answers USING btree (participant_id, question_id);

CREATE INDEX idx_participant_answers_participant ON public.participant_answers USING btree (participant_id);


CREATE TABLE "public"."participant_final_level_answers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "answer_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "answered_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participant_final_level_answers_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_final_level_answers_participant_id_question_id_key ON public.participant_final_level_answers USING btree (participant_id, question_id);

CREATE INDEX idx_final_answers_participant ON public.participant_final_level_answers USING btree (participant_id);


CREATE TABLE "public"."participant_final_level_progress" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "level_id" uuid NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "completed_at" timestamptz,
    CONSTRAINT "participant_final_level_progress_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_final_level_progress_participant_id_level_id_key ON public.participant_final_level_progress USING btree (participant_id, level_id);

CREATE INDEX idx_final_progress_participant ON public.participant_final_level_progress USING btree (participant_id);


CREATE TABLE "public"."participant_golden_level_answers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "answer_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "answered_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participant_golden_level_answers_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_golden_level_answers_participant_id_question_id_key ON public.participant_golden_level_answers USING btree (participant_id, question_id);

CREATE INDEX idx_golden_answers_participant ON public.participant_golden_level_answers USING btree (participant_id);


CREATE TABLE "public"."participant_golden_level_progress" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "level_id" uuid NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "completed_at" timestamptz,
    CONSTRAINT "participant_golden_level_progress_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_golden_level_progress_participant_id_level_id_key ON public.participant_golden_level_progress USING btree (participant_id, level_id);

CREATE INDEX idx_golden_progress_participant ON public.participant_golden_level_progress USING btree (participant_id);


CREATE TABLE "public"."participant_level_exam_answers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "exam_question_id" uuid NOT NULL,
    "answer_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "answered_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participant_level_exam_answers_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_level_exam_answer_participant_id_exam_question__key ON public.participant_level_exam_answers USING btree (participant_id, exam_question_id);


CREATE TABLE "public"."participant_level_progress" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "level_id" uuid NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "completed_at" timestamptz,
    CONSTRAINT "participant_level_progress_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_level_progress_participant_id_level_id_key ON public.participant_level_progress USING btree (participant_id, level_id);

CREATE INDEX idx_level_progress_participant ON public.participant_level_progress USING btree (participant_id);


CREATE TABLE "public"."participant_mission_progress" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "mission_id" uuid NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "completed_at" timestamptz,
    CONSTRAINT "participant_mission_progress_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_mission_progress_participant_id_mission_id_key ON public.participant_mission_progress USING btree (participant_id, mission_id);

CREATE INDEX idx_mission_progress_mission ON public.participant_mission_progress USING btree (mission_id);

CREATE INDEX idx_mission_progress_participant ON public.participant_mission_progress USING btree (participant_id);


CREATE TABLE "public"."participant_world_exam_answers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "exam_question_id" uuid NOT NULL,
    "answer_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "answered_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participant_world_exam_answers_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_world_exam_answer_participant_id_exam_question__key ON public.participant_world_exam_answers USING btree (participant_id, exam_question_id);


CREATE TABLE "public"."participant_world_progress" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "participant_id" uuid NOT NULL,
    "world_id" uuid NOT NULL,
    "stars_earned" integer DEFAULT '0' NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "completed_at" timestamptz,
    CONSTRAINT "participant_world_progress_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participant_world_progress_participant_id_world_id_key ON public.participant_world_progress USING btree (participant_id, world_id);

CREATE INDEX idx_world_progress_participant ON public.participant_world_progress USING btree (participant_id);


CREATE TABLE "public"."participants" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "dni" character varying(20) NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "email" character varying(255),
    "group_id" uuid,
    "is_active" boolean DEFAULT true NOT NULL,
    "total_stars" integer DEFAULT '0' NOT NULL,
    "last_login" timestamptz,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX participants_dni_key ON public.participants USING btree (dni);

CREATE INDEX idx_participants_active ON public.participants USING btree (is_active);

CREATE INDEX idx_participants_dni ON public.participants USING btree (dni);

CREATE INDEX idx_participants_group ON public.participants USING btree (group_id);

CREATE INDEX idx_participants_stars ON public.participants USING btree (total_stars DESC);


CREATE TABLE "public"."questions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "mission_id" uuid NOT NULL,
    "content" text NOT NULL,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "stars_value" integer DEFAULT '1' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_questions_mission ON public.questions USING btree (mission_id);


CREATE TABLE "public"."system_config" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "key" character varying(100) NOT NULL,
    "value" text,
    "description" text,
    "updated_by" uuid,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX system_config_key_key ON public.system_config USING btree (key);


CREATE TABLE "public"."system_users" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "username" character varying(100) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "role" user_role DEFAULT reporter NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_login" timestamptz,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "system_users_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX system_users_email_key ON public.system_users USING btree (email);

CREATE UNIQUE INDEX system_users_username_key ON public.system_users USING btree (username);


CREATE TABLE "v_group_ranking" ("group_id" uuid, "group_name" character varying(255), "participant_count" bigint, "total_group_stars" bigint, "group_rank" bigint);


CREATE TABLE "v_participant_ranking" ("id" uuid, "full_name" character varying(255), "dni" character varying(20), "total_stars" integer, "group_name" character varying(255), "group_id" uuid, "global_rank" bigint);


CREATE TABLE "v_participant_summary" ("id" uuid, "full_name" character varying(255), "dni" character varying(20), "total_stars" integer, "last_login" timestamptz, "group_name" character varying(255), "missions_completed" bigint, "levels_completed" bigint, "worlds_completed" bigint);


CREATE TABLE "v_top10_groups" ("group_id" uuid, "group_name" character varying(255), "participant_count" bigint, "total_group_stars" bigint, "group_rank" bigint);


CREATE TABLE "v_top10_participants" ("id" uuid, "full_name" character varying(255), "dni" character varying(20), "total_stars" integer, "group_name" character varying(255), "group_id" uuid, "global_rank" bigint);


CREATE TABLE "public"."world_exam_options" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "exam_question_id" uuid NOT NULL,
    "text" text NOT NULL,
    "image_id" uuid,
    "is_correct" boolean DEFAULT false NOT NULL,
    "detail" text,
    "order_num" integer NOT NULL,
    CONSTRAINT "world_exam_options_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


CREATE TABLE "public"."world_exam_questions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "world_exam_id" uuid NOT NULL,
    "content" text NOT NULL,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "stars_3" integer DEFAULT '10' NOT NULL,
    "stars_2" integer DEFAULT '5' NOT NULL,
    "stars_1" integer DEFAULT '3' NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "world_exam_questions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


CREATE TABLE "public"."world_exams" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "world_id" uuid NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "world_exams_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX world_exams_world_id_key ON public.world_exams USING btree (world_id);


CREATE TABLE "public"."worlds" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" text,
    "image_id" uuid,
    "order_num" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_worlds_active_order ON public.worlds USING btree (is_active, order_num);

CREATE UNIQUE INDEX idx_worlds_order ON public.worlds USING btree (order_num);


ALTER TABLE ONLY "public"."activity_logs" ADD CONSTRAINT "activity_logs_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."admin_access_logs" ADD CONSTRAINT "admin_access_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "public".system_users(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."answer_options" ADD CONSTRAINT "answer_options_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."final_level_answer_options" ADD CONSTRAINT "final_level_answer_options_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."final_level_answer_options" ADD CONSTRAINT "final_level_answer_options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".final_level_questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."final_level_questions" ADD CONSTRAINT "final_level_questions_end_video_id_fkey" FOREIGN KEY (end_video_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."final_level_questions" ADD CONSTRAINT "final_level_questions_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."final_level_questions" ADD CONSTRAINT "final_level_questions_start_video_id_fkey" FOREIGN KEY (start_video_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."golden_level_answer_options" ADD CONSTRAINT "golden_level_answer_options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".golden_level_questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."golden_level_items" ADD CONSTRAINT "golden_level_items_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."golden_level_questions" ADD CONSTRAINT "golden_level_questions_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."level_exam_options" ADD CONSTRAINT "level_exam_options_exam_question_id_fkey" FOREIGN KEY (exam_question_id) REFERENCES "public".level_exam_questions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."level_exam_options" ADD CONSTRAINT "level_exam_options_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."level_exam_questions" ADD CONSTRAINT "level_exam_questions_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."level_exam_questions" ADD CONSTRAINT "level_exam_questions_level_exam_id_fkey" FOREIGN KEY (level_exam_id) REFERENCES "public".level_exams(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."level_exams" ADD CONSTRAINT "level_exams_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."levels" ADD CONSTRAINT "levels_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."levels" ADD CONSTRAINT "levels_intro_video_id_fkey" FOREIGN KEY (intro_video_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."levels" ADD CONSTRAINT "levels_world_id_fkey" FOREIGN KEY (world_id) REFERENCES "public".worlds(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."media_library" ADD CONSTRAINT "media_library_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES "public".system_users(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."mission_items" ADD CONSTRAINT "mission_items_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."mission_items" ADD CONSTRAINT "mission_items_mission_id_fkey" FOREIGN KEY (mission_id) REFERENCES "public".missions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."mission_items" ADD CONSTRAINT "mission_items_thumbnail_id_fkey" FOREIGN KEY (thumbnail_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."missions" ADD CONSTRAINT "missions_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."missions" ADD CONSTRAINT "missions_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_answers" ADD CONSTRAINT "participant_answers_answer_id_fkey" FOREIGN KEY (answer_id) REFERENCES "public".answer_options(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."participant_answers" ADD CONSTRAINT "participant_answers_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_answers" ADD CONSTRAINT "participant_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_final_level_answers" ADD CONSTRAINT "participant_final_level_answers_answer_id_fkey" FOREIGN KEY (answer_id) REFERENCES "public".final_level_answer_options(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."participant_final_level_answers" ADD CONSTRAINT "participant_final_level_answers_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_final_level_answers" ADD CONSTRAINT "participant_final_level_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".final_level_questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_final_level_progress" ADD CONSTRAINT "participant_final_level_progress_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_final_level_progress" ADD CONSTRAINT "participant_final_level_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_golden_level_answers" ADD CONSTRAINT "participant_golden_level_answers_answer_id_fkey" FOREIGN KEY (answer_id) REFERENCES "public".golden_level_answer_options(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."participant_golden_level_answers" ADD CONSTRAINT "participant_golden_level_answers_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_golden_level_answers" ADD CONSTRAINT "participant_golden_level_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES "public".golden_level_questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_golden_level_progress" ADD CONSTRAINT "participant_golden_level_progress_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_golden_level_progress" ADD CONSTRAINT "participant_golden_level_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_level_exam_answers" ADD CONSTRAINT "participant_level_exam_answers_answer_id_fkey" FOREIGN KEY (answer_id) REFERENCES "public".level_exam_options(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."participant_level_exam_answers" ADD CONSTRAINT "participant_level_exam_answers_exam_question_id_fkey" FOREIGN KEY (exam_question_id) REFERENCES "public".level_exam_questions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_level_exam_answers" ADD CONSTRAINT "participant_level_exam_answers_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_level_progress" ADD CONSTRAINT "participant_level_progress_level_id_fkey" FOREIGN KEY (level_id) REFERENCES "public".levels(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_level_progress" ADD CONSTRAINT "participant_level_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_mission_progress" ADD CONSTRAINT "participant_mission_progress_mission_id_fkey" FOREIGN KEY (mission_id) REFERENCES "public".missions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_mission_progress" ADD CONSTRAINT "participant_mission_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_world_exam_answers" ADD CONSTRAINT "participant_world_exam_answers_answer_id_fkey" FOREIGN KEY (answer_id) REFERENCES "public".world_exam_options(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."participant_world_exam_answers" ADD CONSTRAINT "participant_world_exam_answers_exam_question_id_fkey" FOREIGN KEY (exam_question_id) REFERENCES "public".world_exam_questions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_world_exam_answers" ADD CONSTRAINT "participant_world_exam_answers_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participant_world_progress" ADD CONSTRAINT "participant_world_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES "public".participants(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."participant_world_progress" ADD CONSTRAINT "participant_world_progress_world_id_fkey" FOREIGN KEY (world_id) REFERENCES "public".worlds(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."participants" ADD CONSTRAINT "participants_group_id_fkey" FOREIGN KEY (group_id) REFERENCES "public".groups(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."questions" ADD CONSTRAINT "questions_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."questions" ADD CONSTRAINT "questions_mission_id_fkey" FOREIGN KEY (mission_id) REFERENCES "public".missions(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."system_config" ADD CONSTRAINT "system_config_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES "public".system_users(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."world_exam_options" ADD CONSTRAINT "world_exam_options_exam_question_id_fkey" FOREIGN KEY (exam_question_id) REFERENCES "public".world_exam_questions(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."world_exam_options" ADD CONSTRAINT "world_exam_options_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;

ALTER TABLE ONLY "public"."world_exam_questions" ADD CONSTRAINT "world_exam_questions_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."world_exam_questions" ADD CONSTRAINT "world_exam_questions_world_exam_id_fkey" FOREIGN KEY (world_exam_id) REFERENCES "public".world_exams(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."world_exams" ADD CONSTRAINT "world_exams_world_id_fkey" FOREIGN KEY (world_id) REFERENCES "public".worlds(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."worlds" ADD CONSTRAINT "worlds_image_id_fkey" FOREIGN KEY (image_id) REFERENCES "public".media_library(id) ON DELETE SET NULL;

DROP TABLE IF EXISTS "v_group_ranking";
CREATE VIEW "public"."v_group_ranking" AS SELECT g.id AS group_id,
    g.name AS group_name,
    count(p.id) AS participant_count,
    COALESCE(sum(p.total_stars), (0)::bigint) AS total_group_stars,
    rank() OVER (ORDER BY COALESCE(sum(p.total_stars), (0)::bigint) DESC) AS group_rank
   FROM (groups g
     LEFT JOIN participants p ON (((p.group_id = g.id) AND (p.is_active = true))))
  GROUP BY g.id, g.name;

DROP TABLE IF EXISTS "v_participant_ranking";
CREATE VIEW "public"."v_participant_ranking" AS SELECT p.id,
    p.full_name,
    p.dni,
    p.total_stars,
    g.name AS group_name,
    g.id AS group_id,
    rank() OVER (ORDER BY p.total_stars DESC) AS global_rank
   FROM (participants p
     LEFT JOIN groups g ON ((g.id = p.group_id)))
  WHERE (p.is_active = true);

DROP TABLE IF EXISTS "v_participant_summary";
CREATE VIEW "public"."v_participant_summary" AS SELECT p.id,
    p.full_name,
    p.dni,
    p.total_stars,
    p.last_login,
    g.name AS group_name,
    ( SELECT count(*) AS count
           FROM participant_mission_progress pmp
          WHERE ((pmp.participant_id = p.id) AND pmp.is_completed)) AS missions_completed,
    ( SELECT count(*) AS count
           FROM participant_level_progress plp
          WHERE ((plp.participant_id = p.id) AND plp.is_completed)) AS levels_completed,
    ( SELECT count(*) AS count
           FROM participant_world_progress pwp
          WHERE ((pwp.participant_id = p.id) AND pwp.is_completed)) AS worlds_completed
   FROM (participants p
     LEFT JOIN groups g ON ((g.id = p.group_id)))
  WHERE (p.is_active = true);

DROP TABLE IF EXISTS "v_top10_groups";
CREATE VIEW "public"."v_top10_groups" AS SELECT v_group_ranking.group_id,
    v_group_ranking.group_name,
    v_group_ranking.participant_count,
    v_group_ranking.total_group_stars,
    v_group_ranking.group_rank
   FROM v_group_ranking
 LIMIT 10;

DROP TABLE IF EXISTS "v_top10_participants";
CREATE VIEW "public"."v_top10_participants" AS SELECT v_participant_ranking.id,
    v_participant_ranking.full_name,
    v_participant_ranking.dni,
    v_participant_ranking.total_stars,
    v_participant_ranking.group_name,
    v_participant_ranking.group_id,
    v_participant_ranking.global_rank
   FROM v_participant_ranking
 LIMIT 10;

-- 2026-09-25 12:05:23 UTC
