-- 在线教育平台数据库表结构
-- 数据库: online_course
-- 编码: UTF8MB4

-- =====================
-- 用户系统
-- =====================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
    status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================
-- 课程分类
-- =====================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- =====================
-- 课程
-- =====================

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cover_image VARCHAR(500),
    hours INT DEFAULT 0,
    chapters_count INT DEFAULT 0,
    tags JSON,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);

-- =====================
-- 章节
-- =====================

CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chapters_course ON chapters(course_id);
CREATE INDEX idx_chapters_sort ON chapters(course_id, sort_order);

-- =====================
-- 报名/选课
-- =====================

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- =====================
-- 章节进度
-- =====================

CREATE TABLE IF NOT EXISTS chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    UNIQUE(user_id, chapter_id)
);

CREATE INDEX idx_chapter_progress_user ON chapter_progress(user_id);
CREATE INDEX idx_chapter_progress_chapter ON chapter_progress(chapter_id);

-- =====================
-- 试卷
-- =====================

CREATE TABLE IF NOT EXISTS exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    description TEXT,
    time_limit INT DEFAULT 90 COMMENT '分钟',
    total_score INT DEFAULT 100,
    passing_score INT DEFAULT 60,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    status ENUM('draft', 'published') DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_papers_course ON exam_papers(course_id);
CREATE INDEX idx_exam_papers_status ON exam_papers(status);

-- =====================
-- 题目
-- =====================

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    type ENUM('single_choice', 'multi_choice', 'fill_blank', 'short_answer', 'essay') NOT NULL,
    content TEXT NOT NULL,
    options JSON COMMENT '选择题选项',
    answer JSON NOT NULL COMMENT '正确答案',
    explanation TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    score INT DEFAULT 5,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_type ON questions(type);

-- =====================
-- 试卷题目关联
-- =====================

CREATE TABLE IF NOT EXISTS paper_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    sort_order INT DEFAULT 0,
    score INT,
    UNIQUE(paper_id, question_id)
);

CREATE INDEX idx_paper_questions_paper ON paper_questions(paper_id);

-- =====================
-- 考试记录
-- =====================

CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
    score INT,
    status ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    answers JSON COMMENT '{"question_id": "answer"}'
);

CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_paper ON exam_attempts(paper_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);

-- =====================
-- 教材资料
-- =====================

CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    type ENUM('PDF', 'PPT', 'DOC', 'IMAGE', 'VIDEO') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0 COMMENT '字节',
    downloads INT DEFAULT 0,
    view_count INT DEFAULT 0,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_course ON materials(course_id);
CREATE INDEX idx_materials_type ON materials(type);

-- =====================
-- 直播课堂
-- =====================

CREATE TABLE IF NOT EXISTS live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    status ENUM('scheduled', 'live', 'ended', 'cancelled') DEFAULT 'scheduled',
    meeting_url VARCHAR(500),
    max_participants INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_live_classes_course ON live_classes(course_id);
CREATE INDEX idx_live_classes_teacher ON live_classes(teacher_id);
CREATE INDEX idx_live_classes_status ON live_classes(status);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_at);

-- =====================
-- 课堂录像
-- =====================

CREATE TABLE IF NOT EXISTS class_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    duration INT DEFAULT 0 COMMENT '秒',
    video_url VARCHAR(500),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_recordings_live ON class_recordings(live_class_id);

-- =====================
-- 聊天室频道
-- =====================

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('public', 'private') DEFAULT 'public',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 聊天室消息
-- =====================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- =====================
-- AI角色
-- =====================

CREATE TABLE IF NOT EXISTS ai_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    subtitle VARCHAR(200),
    description TEXT,
    system_prompt TEXT,
    greeting TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_roles_slug ON ai_roles(slug);

-- =====================
-- AI对话
-- =====================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES ai_roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_role ON ai_conversations(role_id);

-- =====================
-- AI消息
-- =====================

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at);

-- =====================
-- 通知公告
-- =====================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('exam', 'homework', 'notice', 'live') DEFAULT 'notice',
    priority ENUM('normal', 'important', 'urgent') DEFAULT 'normal',
    target_all BOOLEAN DEFAULT true,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_published ON announcements(published_at);

-- =====================
-- 用户公告阅读记录
-- =====================

CREATE TABLE IF NOT EXISTS user_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    UNIQUE(user_id, announcement_id)
);

CREATE INDEX idx_user_announcements_user ON user_announcements(user_id);
CREATE INDEX idx_user_announcements_announcement ON user_announcements(announcement_id);

-- =====================
-- 学习统计视图（可选）
-- =====================

CREATE OR REPLACE VIEW user_learning_stats AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COUNT(DISTINCT e.id) as enrolled_courses,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_courses,
    COUNT(DISTINCT ea.id) as total_exams,
    AVG(CASE WHEN ea.status = 'graded' THEN ea.score END) as avg_exam_score,
    MAX(e.last_accessed) as last_learning_date
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
LEFT JOIN exam_attempts ea ON u.id = ea.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.name;

-- =====================
-- 课程统计视图（可选）
-- =====================

CREATE OR REPLACE VIEW course_stats AS
SELECT 
    c.id as course_id,
    c.title as course_title,
    COUNT(DISTINCT e.id) as enrollment_count,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completion_count,
    AVG(e.progress) as avg_progress,
    COUNT(DISTINCT ea.id) as exam_attempt_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN exam_papers ep ON c.id = ep.course_id
LEFT JOIN exam_attempts ea ON ep.id = ea.paper_id
WHERE c.is_published = true
GROUP BY c.id, c.title;
