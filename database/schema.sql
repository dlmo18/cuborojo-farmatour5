--
-- PostgreSQL database dump
--

\restrict dgvwtbdaL82ApwFATRGhDUGOiptZ5EEtMe3MC825K4tfQvJ3ybtqHXjz5DXBwbD

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: level_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.level_type AS ENUM (
    'normal',
    'golden',
    'final'
);


ALTER TYPE public.level_type OWNER TO postgres;

--
-- Name: log_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.log_action AS ENUM (
    'login',
    'logout',
    'mission_view',
    'mission_complete',
    'level_complete',
    'world_complete',
    'exam_start',
    'exam_complete',
    'golden_level_complete',
    'final_level_complete'
);


ALTER TYPE public.log_action OWNER TO postgres;

--
-- Name: media_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.media_type AS ENUM (
    'image',
    'video',
    'audio',
    'document'
);


ALTER TYPE public.media_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'manager',
    'reporter'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: fn_group_rank(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_group_rank(p_participant_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.fn_group_rank(p_participant_id uuid) OWNER TO postgres;

--
-- Name: fn_update_participant_stars(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_participant_stars(p_participant_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.fn_update_participant_stars(p_participant_id uuid) OWNER TO postgres;

--
-- Name: trg_update_stars(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trg_update_stars() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM fn_update_participant_stars(NEW.participant_id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_update_stars() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid,
    action public.log_action NOT NULL,
    entity_type character varying(50),
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: admin_access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_access_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    resource character varying(100),
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_access_logs OWNER TO postgres;

--
-- Name: answer_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    text text NOT NULL,
    image_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    detail text,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.answer_options OWNER TO postgres;

--
-- Name: final_level_answer_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_level_answer_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    text text NOT NULL,
    image_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.final_level_answer_options OWNER TO postgres;

--
-- Name: final_level_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_level_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    content text NOT NULL,
    start_video_url character varying(500),
    start_video_id uuid,
    end_video_url character varying(500),
    end_video_id uuid,
    correct_message text,
    incorrect_message text,
    order_num integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.final_level_questions OWNER TO postgres;

--
-- Name: TABLE final_level_questions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.final_level_questions IS 'Preguntas para niveles finales - con videos de inicio y cierre';


--
-- Name: golden_level_answer_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.golden_level_answer_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.golden_level_answer_options OWNER TO postgres;

--
-- Name: golden_level_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.golden_level_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    detail text,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.golden_level_items OWNER TO postgres;

--
-- Name: TABLE golden_level_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.golden_level_items IS 'Items de contenido para niveles dorados - contienen título y detalle';


--
-- Name: golden_level_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.golden_level_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    content text NOT NULL,
    order_num integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.golden_level_questions OWNER TO postgres;

--
-- Name: TABLE golden_level_questions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.golden_level_questions IS 'Preguntas para evaluación de niveles dorados - solo texto en opciones';


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: level_exam_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level_exam_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    exam_question_id uuid NOT NULL,
    text text NOT NULL,
    image_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    detail text,
    order_num integer NOT NULL
);


ALTER TABLE public.level_exam_options OWNER TO postgres;

--
-- Name: level_exam_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level_exam_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_exam_id uuid NOT NULL,
    content text NOT NULL,
    image_id uuid,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.level_exam_questions OWNER TO postgres;

--
-- Name: level_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level_exams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.level_exams OWNER TO postgres;

--
-- Name: levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.levels (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    world_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image_id uuid,
    order_num integer NOT NULL,
    is_golden boolean DEFAULT false NOT NULL,
    max_stars integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    level_type public.level_type DEFAULT 'normal'::public.level_type NOT NULL,
    intro_video_url character varying(500),
    intro_video_id uuid
);


ALTER TABLE public.levels OWNER TO postgres;

--
-- Name: COLUMN levels.level_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.levels.level_type IS 'Tipo de nivel: normal (con misiones), golden (sin misiones, solo contenido), final (solo preguntas)';


--
-- Name: COLUMN levels.intro_video_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.levels.intro_video_url IS 'URL del video introductorio (usado en niveles finales)';


--
-- Name: media_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_library (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    type public.media_type NOT NULL,
    url character varying(500) NOT NULL,
    file_size bigint,
    mime_type character varying(100),
    width integer,
    height integer,
    duration integer,
    tags text[],
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media_library OWNER TO postgres;

--
-- Name: mission_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mission_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mission_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    image_id uuid,
    thumbnail_id uuid,
    benefits text,
    content_badges jsonb DEFAULT '[]'::jsonb,
    detail text,
    order_num integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mission_items OWNER TO postgres;

--
-- Name: missions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.missions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image_id uuid,
    order_num integer NOT NULL,
    max_stars integer DEFAULT 3 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.missions OWNER TO postgres;

--
-- Name: participant_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participant_answers OWNER TO postgres;

--
-- Name: participant_final_level_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_final_level_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participant_final_level_answers OWNER TO postgres;

--
-- Name: participant_final_level_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_final_level_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    level_id uuid NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.participant_final_level_progress OWNER TO postgres;

--
-- Name: participant_golden_level_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_golden_level_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participant_golden_level_answers OWNER TO postgres;

--
-- Name: participant_golden_level_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_golden_level_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    level_id uuid NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.participant_golden_level_progress OWNER TO postgres;

--
-- Name: participant_level_exam_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_level_exam_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    exam_question_id uuid NOT NULL,
    answer_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participant_level_exam_answers OWNER TO postgres;

--
-- Name: participant_level_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_level_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    level_id uuid NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.participant_level_progress OWNER TO postgres;

--
-- Name: participant_mission_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_mission_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    mission_id uuid NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.participant_mission_progress OWNER TO postgres;

--
-- Name: participant_world_exam_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_world_exam_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    exam_question_id uuid NOT NULL,
    answer_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participant_world_exam_answers OWNER TO postgres;

--
-- Name: participant_world_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant_world_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    participant_id uuid NOT NULL,
    world_id uuid NOT NULL,
    stars_earned integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.participant_world_progress OWNER TO postgres;

--
-- Name: participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    dni character varying(20) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255),
    group_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    total_stars integer DEFAULT 0 NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.participants OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mission_id uuid NOT NULL,
    content text NOT NULL,
    image_id uuid,
    order_num integer NOT NULL,
    stars_value integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: system_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255),
    role public.user_role DEFAULT 'reporter'::public.user_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_users OWNER TO postgres;

--
-- Name: v_group_ranking; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_group_ranking AS
 SELECT g.id AS group_id,
    g.name AS group_name,
    count(p.id) AS participant_count,
    COALESCE(sum(p.total_stars), (0)::bigint) AS total_group_stars,
    rank() OVER (ORDER BY COALESCE(sum(p.total_stars), (0)::bigint) DESC) AS group_rank
   FROM (public.groups g
     LEFT JOIN public.participants p ON (((p.group_id = g.id) AND (p.is_active = true))))
  GROUP BY g.id, g.name;


ALTER VIEW public.v_group_ranking OWNER TO postgres;

--
-- Name: v_participant_ranking; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_participant_ranking AS
 SELECT p.id,
    p.full_name,
    p.dni,
    p.total_stars,
    g.name AS group_name,
    g.id AS group_id,
    rank() OVER (ORDER BY p.total_stars DESC) AS global_rank
   FROM (public.participants p
     LEFT JOIN public.groups g ON ((g.id = p.group_id)))
  WHERE (p.is_active = true);


ALTER VIEW public.v_participant_ranking OWNER TO postgres;

--
-- Name: v_participant_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_participant_summary AS
 SELECT p.id,
    p.full_name,
    p.dni,
    p.total_stars,
    p.last_login,
    g.name AS group_name,
    ( SELECT count(*) AS count
           FROM public.participant_mission_progress pmp
          WHERE ((pmp.participant_id = p.id) AND pmp.is_completed)) AS missions_completed,
    ( SELECT count(*) AS count
           FROM public.participant_level_progress plp
          WHERE ((plp.participant_id = p.id) AND plp.is_completed)) AS levels_completed,
    ( SELECT count(*) AS count
           FROM public.participant_world_progress pwp
          WHERE ((pwp.participant_id = p.id) AND pwp.is_completed)) AS worlds_completed
   FROM (public.participants p
     LEFT JOIN public.groups g ON ((g.id = p.group_id)))
  WHERE (p.is_active = true);


ALTER VIEW public.v_participant_summary OWNER TO postgres;

--
-- Name: v_top10_groups; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_top10_groups AS
 SELECT group_id,
    group_name,
    participant_count,
    total_group_stars,
    group_rank
   FROM public.v_group_ranking
 LIMIT 10;


ALTER VIEW public.v_top10_groups OWNER TO postgres;

--
-- Name: v_top10_participants; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_top10_participants AS
 SELECT id,
    full_name,
    dni,
    total_stars,
    group_name,
    group_id,
    global_rank
   FROM public.v_participant_ranking
 LIMIT 10;


ALTER VIEW public.v_top10_participants OWNER TO postgres;

--
-- Name: world_exam_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.world_exam_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    exam_question_id uuid NOT NULL,
    text text NOT NULL,
    image_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    detail text,
    order_num integer NOT NULL
);


ALTER TABLE public.world_exam_options OWNER TO postgres;

--
-- Name: world_exam_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.world_exam_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    world_exam_id uuid NOT NULL,
    content text NOT NULL,
    image_id uuid,
    order_num integer NOT NULL,
    stars_3 integer DEFAULT 10 NOT NULL,
    stars_2 integer DEFAULT 5 NOT NULL,
    stars_1 integer DEFAULT 3 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.world_exam_questions OWNER TO postgres;

--
-- Name: world_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.world_exams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    world_id uuid NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.world_exams OWNER TO postgres;

--
-- Name: worlds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worlds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image_id uuid,
    order_num integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.worlds OWNER TO postgres;

--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_access_logs admin_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_access_logs
    ADD CONSTRAINT admin_access_logs_pkey PRIMARY KEY (id);


--
-- Name: answer_options answer_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_options
    ADD CONSTRAINT answer_options_pkey PRIMARY KEY (id);


--
-- Name: final_level_answer_options final_level_answer_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_answer_options
    ADD CONSTRAINT final_level_answer_options_pkey PRIMARY KEY (id);


--
-- Name: final_level_questions final_level_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_questions
    ADD CONSTRAINT final_level_questions_pkey PRIMARY KEY (id);


--
-- Name: golden_level_answer_options golden_level_answer_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_answer_options
    ADD CONSTRAINT golden_level_answer_options_pkey PRIMARY KEY (id);


--
-- Name: golden_level_items golden_level_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_items
    ADD CONSTRAINT golden_level_items_pkey PRIMARY KEY (id);


--
-- Name: golden_level_questions golden_level_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_questions
    ADD CONSTRAINT golden_level_questions_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: level_exam_options level_exam_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_options
    ADD CONSTRAINT level_exam_options_pkey PRIMARY KEY (id);


--
-- Name: level_exam_questions level_exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_questions
    ADD CONSTRAINT level_exam_questions_pkey PRIMARY KEY (id);


--
-- Name: level_exams level_exams_level_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exams
    ADD CONSTRAINT level_exams_level_id_key UNIQUE (level_id);


--
-- Name: level_exams level_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exams
    ADD CONSTRAINT level_exams_pkey PRIMARY KEY (id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: media_library media_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_library
    ADD CONSTRAINT media_library_pkey PRIMARY KEY (id);


--
-- Name: mission_items mission_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mission_items
    ADD CONSTRAINT mission_items_pkey PRIMARY KEY (id);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);


--
-- Name: participant_answers participant_answers_participant_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_answers
    ADD CONSTRAINT participant_answers_participant_id_question_id_key UNIQUE (participant_id, question_id);


--
-- Name: participant_answers participant_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_answers
    ADD CONSTRAINT participant_answers_pkey PRIMARY KEY (id);


--
-- Name: participant_final_level_answers participant_final_level_answers_participant_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_answers
    ADD CONSTRAINT participant_final_level_answers_participant_id_question_id_key UNIQUE (participant_id, question_id);


--
-- Name: participant_final_level_answers participant_final_level_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_answers
    ADD CONSTRAINT participant_final_level_answers_pkey PRIMARY KEY (id);


--
-- Name: participant_final_level_progress participant_final_level_progress_participant_id_level_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_progress
    ADD CONSTRAINT participant_final_level_progress_participant_id_level_id_key UNIQUE (participant_id, level_id);


--
-- Name: participant_final_level_progress participant_final_level_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_progress
    ADD CONSTRAINT participant_final_level_progress_pkey PRIMARY KEY (id);


--
-- Name: participant_golden_level_answers participant_golden_level_answers_participant_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_answers
    ADD CONSTRAINT participant_golden_level_answers_participant_id_question_id_key UNIQUE (participant_id, question_id);


--
-- Name: participant_golden_level_answers participant_golden_level_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_answers
    ADD CONSTRAINT participant_golden_level_answers_pkey PRIMARY KEY (id);


--
-- Name: participant_golden_level_progress participant_golden_level_progress_participant_id_level_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_progress
    ADD CONSTRAINT participant_golden_level_progress_participant_id_level_id_key UNIQUE (participant_id, level_id);


--
-- Name: participant_golden_level_progress participant_golden_level_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_progress
    ADD CONSTRAINT participant_golden_level_progress_pkey PRIMARY KEY (id);


--
-- Name: participant_level_exam_answers participant_level_exam_answer_participant_id_exam_question__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_exam_answers
    ADD CONSTRAINT participant_level_exam_answer_participant_id_exam_question__key UNIQUE (participant_id, exam_question_id);


--
-- Name: participant_level_exam_answers participant_level_exam_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_exam_answers
    ADD CONSTRAINT participant_level_exam_answers_pkey PRIMARY KEY (id);


--
-- Name: participant_level_progress participant_level_progress_participant_id_level_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_progress
    ADD CONSTRAINT participant_level_progress_participant_id_level_id_key UNIQUE (participant_id, level_id);


--
-- Name: participant_level_progress participant_level_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_progress
    ADD CONSTRAINT participant_level_progress_pkey PRIMARY KEY (id);


--
-- Name: participant_mission_progress participant_mission_progress_participant_id_mission_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_mission_progress
    ADD CONSTRAINT participant_mission_progress_participant_id_mission_id_key UNIQUE (participant_id, mission_id);


--
-- Name: participant_mission_progress participant_mission_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_mission_progress
    ADD CONSTRAINT participant_mission_progress_pkey PRIMARY KEY (id);


--
-- Name: participant_world_exam_answers participant_world_exam_answer_participant_id_exam_question__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_exam_answers
    ADD CONSTRAINT participant_world_exam_answer_participant_id_exam_question__key UNIQUE (participant_id, exam_question_id);


--
-- Name: participant_world_exam_answers participant_world_exam_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_exam_answers
    ADD CONSTRAINT participant_world_exam_answers_pkey PRIMARY KEY (id);


--
-- Name: participant_world_progress participant_world_progress_participant_id_world_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_progress
    ADD CONSTRAINT participant_world_progress_participant_id_world_id_key UNIQUE (participant_id, world_id);


--
-- Name: participant_world_progress participant_world_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_progress
    ADD CONSTRAINT participant_world_progress_pkey PRIMARY KEY (id);


--
-- Name: participants participants_dni_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_dni_key UNIQUE (dni);


--
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_key_key UNIQUE (key);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: system_users system_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_users
    ADD CONSTRAINT system_users_email_key UNIQUE (email);


--
-- Name: system_users system_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_users
    ADD CONSTRAINT system_users_pkey PRIMARY KEY (id);


--
-- Name: system_users system_users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_users
    ADD CONSTRAINT system_users_username_key UNIQUE (username);


--
-- Name: world_exam_options world_exam_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_options
    ADD CONSTRAINT world_exam_options_pkey PRIMARY KEY (id);


--
-- Name: world_exam_questions world_exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_questions
    ADD CONSTRAINT world_exam_questions_pkey PRIMARY KEY (id);


--
-- Name: world_exams world_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exams
    ADD CONSTRAINT world_exams_pkey PRIMARY KEY (id);


--
-- Name: world_exams world_exams_world_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exams
    ADD CONSTRAINT world_exams_world_id_key UNIQUE (world_id);


--
-- Name: worlds worlds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worlds
    ADD CONSTRAINT worlds_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);


--
-- Name: idx_activity_logs_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_logs_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_participant ON public.activity_logs USING btree (participant_id);


--
-- Name: idx_admin_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_user ON public.admin_access_logs USING btree (user_id);


--
-- Name: idx_answer_options_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answer_options_question ON public.answer_options USING btree (question_id);


--
-- Name: idx_final_answers_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_final_answers_participant ON public.participant_final_level_answers USING btree (participant_id);


--
-- Name: idx_final_level_answer_options_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_final_level_answer_options_question ON public.final_level_answer_options USING btree (question_id);


--
-- Name: idx_final_level_questions_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_final_level_questions_level ON public.final_level_questions USING btree (level_id);


--
-- Name: idx_final_level_questions_level_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_final_level_questions_level_order ON public.final_level_questions USING btree (level_id, order_num);


--
-- Name: idx_final_progress_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_final_progress_participant ON public.participant_final_level_progress USING btree (participant_id);


--
-- Name: idx_golden_answers_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_golden_answers_participant ON public.participant_golden_level_answers USING btree (participant_id);


--
-- Name: idx_golden_level_answer_options_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_golden_level_answer_options_question ON public.golden_level_answer_options USING btree (question_id);


--
-- Name: idx_golden_level_items_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_golden_level_items_level ON public.golden_level_items USING btree (level_id);


--
-- Name: idx_golden_level_items_level_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_golden_level_items_level_order ON public.golden_level_items USING btree (level_id, order_num);


--
-- Name: idx_golden_level_questions_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_golden_level_questions_level ON public.golden_level_questions USING btree (level_id);


--
-- Name: idx_golden_level_questions_level_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_golden_level_questions_level_order ON public.golden_level_questions USING btree (level_id, order_num);


--
-- Name: idx_golden_progress_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_golden_progress_participant ON public.participant_golden_level_progress USING btree (participant_id);


--
-- Name: idx_level_progress_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_level_progress_participant ON public.participant_level_progress USING btree (participant_id);


--
-- Name: idx_levels_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_levels_active ON public.levels USING btree (is_active, world_id, order_num);


--
-- Name: idx_levels_world; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_levels_world ON public.levels USING btree (world_id);


--
-- Name: idx_levels_world_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_levels_world_order ON public.levels USING btree (world_id, order_num);


--
-- Name: idx_media_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_type ON public.media_library USING btree (type);


--
-- Name: idx_mission_items_mission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mission_items_mission ON public.mission_items USING btree (mission_id);


--
-- Name: idx_mission_progress_mission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mission_progress_mission ON public.participant_mission_progress USING btree (mission_id);


--
-- Name: idx_mission_progress_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mission_progress_participant ON public.participant_mission_progress USING btree (participant_id);


--
-- Name: idx_missions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_missions_active ON public.missions USING btree (is_active, level_id, order_num);


--
-- Name: idx_missions_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_missions_level ON public.missions USING btree (level_id);


--
-- Name: idx_missions_level_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_missions_level_order ON public.missions USING btree (level_id, order_num);


--
-- Name: idx_participant_answers_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participant_answers_participant ON public.participant_answers USING btree (participant_id);


--
-- Name: idx_participants_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participants_active ON public.participants USING btree (is_active);


--
-- Name: idx_participants_dni; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participants_dni ON public.participants USING btree (dni);


--
-- Name: idx_participants_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participants_group ON public.participants USING btree (group_id);


--
-- Name: idx_participants_stars; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participants_stars ON public.participants USING btree (total_stars DESC);


--
-- Name: idx_questions_mission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_questions_mission ON public.questions USING btree (mission_id);


--
-- Name: idx_world_progress_participant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_world_progress_participant ON public.participant_world_progress USING btree (participant_id);


--
-- Name: idx_worlds_active_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worlds_active_order ON public.worlds USING btree (is_active, order_num);


--
-- Name: idx_worlds_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_worlds_order ON public.worlds USING btree (order_num);


--
-- Name: participant_mission_progress after_mission_progress_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_mission_progress_update AFTER INSERT OR UPDATE ON public.participant_mission_progress FOR EACH ROW EXECUTE FUNCTION public.trg_update_stars();


--
-- Name: participant_world_exam_answers after_world_exam_answer; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_world_exam_answer AFTER INSERT OR UPDATE ON public.participant_world_exam_answers FOR EACH ROW EXECUTE FUNCTION public.trg_update_stars();


--
-- Name: activity_logs activity_logs_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE SET NULL;


--
-- Name: admin_access_logs admin_access_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_access_logs
    ADD CONSTRAINT admin_access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.system_users(id) ON DELETE SET NULL;


--
-- Name: answer_options answer_options_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_options
    ADD CONSTRAINT answer_options_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: answer_options answer_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_options
    ADD CONSTRAINT answer_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: final_level_answer_options final_level_answer_options_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_answer_options
    ADD CONSTRAINT final_level_answer_options_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: final_level_answer_options final_level_answer_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_answer_options
    ADD CONSTRAINT final_level_answer_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.final_level_questions(id) ON DELETE CASCADE;


--
-- Name: final_level_questions final_level_questions_end_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_questions
    ADD CONSTRAINT final_level_questions_end_video_id_fkey FOREIGN KEY (end_video_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: final_level_questions final_level_questions_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_questions
    ADD CONSTRAINT final_level_questions_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: final_level_questions final_level_questions_start_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_level_questions
    ADD CONSTRAINT final_level_questions_start_video_id_fkey FOREIGN KEY (start_video_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: golden_level_answer_options golden_level_answer_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_answer_options
    ADD CONSTRAINT golden_level_answer_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.golden_level_questions(id) ON DELETE CASCADE;


--
-- Name: golden_level_items golden_level_items_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_items
    ADD CONSTRAINT golden_level_items_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: golden_level_questions golden_level_questions_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.golden_level_questions
    ADD CONSTRAINT golden_level_questions_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: level_exam_options level_exam_options_exam_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_options
    ADD CONSTRAINT level_exam_options_exam_question_id_fkey FOREIGN KEY (exam_question_id) REFERENCES public.level_exam_questions(id) ON DELETE CASCADE;


--
-- Name: level_exam_options level_exam_options_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_options
    ADD CONSTRAINT level_exam_options_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: level_exam_questions level_exam_questions_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_questions
    ADD CONSTRAINT level_exam_questions_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: level_exam_questions level_exam_questions_level_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exam_questions
    ADD CONSTRAINT level_exam_questions_level_exam_id_fkey FOREIGN KEY (level_exam_id) REFERENCES public.level_exams(id) ON DELETE CASCADE;


--
-- Name: level_exams level_exams_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_exams
    ADD CONSTRAINT level_exams_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: levels levels_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: levels levels_intro_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_intro_video_id_fkey FOREIGN KEY (intro_video_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: levels levels_world_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_world_id_fkey FOREIGN KEY (world_id) REFERENCES public.worlds(id) ON DELETE CASCADE;


--
-- Name: media_library media_library_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_library
    ADD CONSTRAINT media_library_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.system_users(id) ON DELETE SET NULL;


--
-- Name: mission_items mission_items_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mission_items
    ADD CONSTRAINT mission_items_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: mission_items mission_items_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mission_items
    ADD CONSTRAINT mission_items_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE;


--
-- Name: mission_items mission_items_thumbnail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mission_items
    ADD CONSTRAINT mission_items_thumbnail_id_fkey FOREIGN KEY (thumbnail_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: missions missions_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: missions missions_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: participant_answers participant_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_answers
    ADD CONSTRAINT participant_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answer_options(id) ON DELETE SET NULL;


--
-- Name: participant_answers participant_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_answers
    ADD CONSTRAINT participant_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_answers participant_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_answers
    ADD CONSTRAINT participant_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: participant_final_level_answers participant_final_level_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_answers
    ADD CONSTRAINT participant_final_level_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.final_level_answer_options(id) ON DELETE SET NULL;


--
-- Name: participant_final_level_answers participant_final_level_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_answers
    ADD CONSTRAINT participant_final_level_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_final_level_answers participant_final_level_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_answers
    ADD CONSTRAINT participant_final_level_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.final_level_questions(id) ON DELETE CASCADE;


--
-- Name: participant_final_level_progress participant_final_level_progress_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_progress
    ADD CONSTRAINT participant_final_level_progress_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: participant_final_level_progress participant_final_level_progress_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_final_level_progress
    ADD CONSTRAINT participant_final_level_progress_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_golden_level_answers participant_golden_level_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_answers
    ADD CONSTRAINT participant_golden_level_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.golden_level_answer_options(id) ON DELETE SET NULL;


--
-- Name: participant_golden_level_answers participant_golden_level_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_answers
    ADD CONSTRAINT participant_golden_level_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_golden_level_answers participant_golden_level_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_answers
    ADD CONSTRAINT participant_golden_level_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.golden_level_questions(id) ON DELETE CASCADE;


--
-- Name: participant_golden_level_progress participant_golden_level_progress_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_progress
    ADD CONSTRAINT participant_golden_level_progress_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: participant_golden_level_progress participant_golden_level_progress_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_golden_level_progress
    ADD CONSTRAINT participant_golden_level_progress_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_level_exam_answers participant_level_exam_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_exam_answers
    ADD CONSTRAINT participant_level_exam_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.level_exam_options(id) ON DELETE SET NULL;


--
-- Name: participant_level_exam_answers participant_level_exam_answers_exam_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_exam_answers
    ADD CONSTRAINT participant_level_exam_answers_exam_question_id_fkey FOREIGN KEY (exam_question_id) REFERENCES public.level_exam_questions(id) ON DELETE CASCADE;


--
-- Name: participant_level_exam_answers participant_level_exam_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_exam_answers
    ADD CONSTRAINT participant_level_exam_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_level_progress participant_level_progress_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_progress
    ADD CONSTRAINT participant_level_progress_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: participant_level_progress participant_level_progress_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_level_progress
    ADD CONSTRAINT participant_level_progress_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_mission_progress participant_mission_progress_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_mission_progress
    ADD CONSTRAINT participant_mission_progress_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE;


--
-- Name: participant_mission_progress participant_mission_progress_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_mission_progress
    ADD CONSTRAINT participant_mission_progress_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_world_exam_answers participant_world_exam_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_exam_answers
    ADD CONSTRAINT participant_world_exam_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.world_exam_options(id) ON DELETE SET NULL;


--
-- Name: participant_world_exam_answers participant_world_exam_answers_exam_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_exam_answers
    ADD CONSTRAINT participant_world_exam_answers_exam_question_id_fkey FOREIGN KEY (exam_question_id) REFERENCES public.world_exam_questions(id) ON DELETE CASCADE;


--
-- Name: participant_world_exam_answers participant_world_exam_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_exam_answers
    ADD CONSTRAINT participant_world_exam_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_world_progress participant_world_progress_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_progress
    ADD CONSTRAINT participant_world_progress_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;


--
-- Name: participant_world_progress participant_world_progress_world_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant_world_progress
    ADD CONSTRAINT participant_world_progress_world_id_fkey FOREIGN KEY (world_id) REFERENCES public.worlds(id) ON DELETE CASCADE;


--
-- Name: participants participants_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;


--
-- Name: questions questions_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: questions questions_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE;


--
-- Name: system_config system_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.system_users(id) ON DELETE SET NULL;


--
-- Name: world_exam_options world_exam_options_exam_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_options
    ADD CONSTRAINT world_exam_options_exam_question_id_fkey FOREIGN KEY (exam_question_id) REFERENCES public.world_exam_questions(id) ON DELETE CASCADE;


--
-- Name: world_exam_options world_exam_options_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_options
    ADD CONSTRAINT world_exam_options_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: world_exam_questions world_exam_questions_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_questions
    ADD CONSTRAINT world_exam_questions_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- Name: world_exam_questions world_exam_questions_world_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exam_questions
    ADD CONSTRAINT world_exam_questions_world_exam_id_fkey FOREIGN KEY (world_exam_id) REFERENCES public.world_exams(id) ON DELETE CASCADE;


--
-- Name: world_exams world_exams_world_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.world_exams
    ADD CONSTRAINT world_exams_world_id_fkey FOREIGN KEY (world_id) REFERENCES public.worlds(id) ON DELETE CASCADE;


--
-- Name: worlds worlds_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worlds
    ADD CONSTRAINT worlds_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media_library(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dgvwtbdaL82ApwFATRGhDUGOiptZ5EEtMe3MC825K4tfQvJ3ybtqHXjz5DXBwbD

