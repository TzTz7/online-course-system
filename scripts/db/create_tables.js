[{
  "ddl": "CREATE INDEX answers_attempt_id_question_id_key ON answers(attempt_id, question_id);"
}, {
  "ddl": "CREATE INDEX answers_pkey ON answers(id);"
}, {
  "ddl": "CREATE INDEX categories_pkey ON categories(id);"
}, {
  "ddl": "CREATE INDEX categories_slug_key ON categories(slug);"
}, {
  "ddl": "CREATE INDEX chapter_progress_pkey ON chapter_progress(id);"
}, {
  "ddl": "CREATE INDEX chapter_progress_user_id_chapter_id_key ON chapter_progress(user_id, chapter_id);"
}, {
  "ddl": "CREATE INDEX chapters_pkey ON chapters(id);"
}, {
  "ddl": "CREATE INDEX courses_pkey ON courses(id);"
}, {
  "ddl": "CREATE INDEX courses_slug_key ON courses(slug);"
}, {
  "ddl": "CREATE INDEX exam_attempts_exam_id_user_id_key ON exam_attempts(exam_id, user_id);"
}, {
  "ddl": "CREATE INDEX exam_attempts_pkey ON exam_attempts(id);"
}, {
  "ddl": "CREATE INDEX exam_questions_exam_id_question_id_key ON exam_questions(exam_id, question_id);"
}, {
  "ddl": "CREATE INDEX exam_questions_pkey ON exam_questions(id);"
}, {
  "ddl": "CREATE INDEX exams_pkey ON exams(id);"
}, {
  "ddl": "CREATE INDEX questions_pkey ON questions(id);"
}, {
  "ddl": "CREATE INDEX section_progress_pkey ON section_progress(id);"
}, {
  "ddl": "CREATE INDEX section_progress_user_id_section_id_key ON section_progress(user_id, section_id);"
}, {
  "ddl": "CREATE INDEX sections_pkey ON sections(id);"
}, {
  "ddl": "CREATE INDEX users_email_key ON users(email);"
}, {
  "ddl": "CREATE INDEX users_pkey ON users(id);"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS answers (id uuid NOT NULL DEFAULT gen_random_uuid(), attempt_id uuid NOT NULL, question_id uuid NOT NULL, answer_content jsonb NOT NULL, is_correct boolean, score numeric, question_score integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT answers_pkey PRIMARY KEY (id), CONSTRAINT answers_attempt_id_question_id_key UNIQUE (question_id, attempt_id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS categories (id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying(100) NOT NULL, slug character varying(100) NOT NULL, description text, icon character varying(50), sort_order integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT categories_pkey PRIMARY KEY (id), CONSTRAINT categories_slug_key UNIQUE (slug));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS chapter_progress (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, chapter_id uuid NOT NULL, is_completed boolean DEFAULT false, completed_at timestamp without time zone, CONSTRAINT chapter_progress_pkey PRIMARY KEY (id), CONSTRAINT chapter_progress_user_id_chapter_id_key UNIQUE (user_id, chapter_id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS chapters (id uuid NOT NULL DEFAULT gen_random_uuid(), course_id uuid NOT NULL, title character varying(200) NOT NULL, description text, sort_order integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT chapters_pkey PRIMARY KEY (id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS courses (id uuid NOT NULL DEFAULT gen_random_uuid(), title character varying(200) NOT NULL, slug character varying(200) NOT NULL, description text, teacher_id uuid NOT NULL, category_id uuid, cover_image character varying(500), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT courses_pkey PRIMARY KEY (id), CONSTRAINT courses_slug_key UNIQUE (slug));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS exam_attempts (id uuid NOT NULL DEFAULT gen_random_uuid(), exam_id uuid NOT NULL, user_id uuid NOT NULL, start_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP, submit_time timestamp without time zone, score numeric, total_score integer DEFAULT 0, status character varying(50) DEFAULT 'in_progress'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT exam_attempts_pkey PRIMARY KEY (id), CONSTRAINT exam_attempts_exam_id_user_id_key UNIQUE (exam_id, user_id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS exam_questions (id uuid NOT NULL DEFAULT gen_random_uuid(), exam_id uuid NOT NULL, question_id uuid NOT NULL, score integer DEFAULT 5, sort_order integer DEFAULT 1, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT exam_questions_pkey PRIMARY KEY (id), CONSTRAINT exam_questions_exam_id_question_id_key UNIQUE (question_id, exam_id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS exams (id uuid NOT NULL DEFAULT gen_random_uuid(), title character varying(200) NOT NULL, description text, course_id uuid, duration integer DEFAULT 90, total_score integer DEFAULT 100, shuffle_questions boolean DEFAULT false, question_count integer DEFAULT 0, start_time timestamp without time zone, end_time timestamp without time zone, status character varying(50) DEFAULT 'draft'::character varying, created_by uuid, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT exams_pkey PRIMARY KEY (id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS questions (id uuid NOT NULL DEFAULT gen_random_uuid(), course_id uuid, type character varying(50) NOT NULL, title text NOT NULL, options jsonb DEFAULT '[]'::jsonb, answer jsonb NOT NULL, score integer DEFAULT 5, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT questions_pkey PRIMARY KEY (id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS section_progress (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, section_id uuid NOT NULL, is_completed boolean DEFAULT false, completed_at timestamp without time zone, CONSTRAINT section_progress_pkey PRIMARY KEY (id), CONSTRAINT section_progress_user_id_section_id_key UNIQUE (section_id, user_id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS sections (id uuid NOT NULL DEFAULT gen_random_uuid(), chapter_id uuid NOT NULL, title character varying(200) NOT NULL, content_type character varying(50) DEFAULT 'text'::character varying, content text, duration integer DEFAULT 0, sort_order integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT sections_pkey PRIMARY KEY (id));"
}, {
  "ddl": "CREATE TABLE IF NOT EXISTS users (id uuid NOT NULL DEFAULT gen_random_uuid(), email character varying(255) NOT NULL, password_hash character varying(255) NOT NULL, name character varying(100) NOT NULL, avatar character varying(500), role character varying(50) NOT NULL, status character varying(50) NOT NULL DEFAULT 'active'::character varying, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, CONSTRAINT users_pkey PRIMARY KEY (id), CONSTRAINT users_email_key UNIQUE (email));"
}]
