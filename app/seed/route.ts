import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { users, categories, courses, chapters, aiRoles } from '@/lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      avatar VARCHAR(500),
      role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
      status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, email, password_hash, name, avatar, role, status)
        VALUES (${user.id}, ${user.email}, ${hashedPassword}, ${user.name}, ${user.avatar}, ${user.role}, ${user.status})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedCategories() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedCategories = await Promise.all(
    categories.map((category) =>
      sql`
        INSERT INTO categories (id, name, slug, description, icon, sort_order)
        VALUES (${category.id}, ${category.name}, ${category.slug}, ${category.description}, ${category.icon}, ${category.sort_order})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedCategories;
}

async function seedCourses() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(200) NOT NULL UNIQUE,
      description TEXT,
      teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      cover_image VARCHAR(500),
      hours INT DEFAULT 0,
      chapters_count INT DEFAULT 0,
      tags JSON,
      difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedCourses = await Promise.all(
    courses.map((course) =>
      sql`
        INSERT INTO courses (id, title, slug, description, teacher_id, category_id, cover_image, hours, chapters_count, tags, difficulty, is_published)
        VALUES (${course.id}, ${course.title}, ${course.slug}, ${course.description}, ${course.teacher_id}, ${course.category_id}, ${course.cover_image}, ${course.hours}, ${course.chapters_count}, ${JSON.stringify(course.tags)}, ${course.difficulty}, ${course.is_published})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedCourses;
}

async function seedChapters() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS chapters (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      sort_order INT DEFAULT 0,
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedChapters = await Promise.all(
    chapters.map((chapter) =>
      sql`
        INSERT INTO chapters (id, course_id, title, description, sort_order, is_published)
        VALUES (${chapter.id}, ${chapter.course_id}, ${chapter.title}, ${chapter.description}, ${chapter.sort_order}, ${chapter.is_published})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedChapters;
}

async function seedEnrollments() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    );
  `;
}

async function seedChapterProgress() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS chapter_progress (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMP,
      UNIQUE(user_id, chapter_id)
    );
  `;
}

async function seedExamPapers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS exam_papers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
      description TEXT,
      time_limit INT DEFAULT 90,
      total_score INT DEFAULT 100,
      passing_score INT DEFAULT 60,
      difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
      status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      scheduled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedQuestions() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'fill_blank', 'short_answer', 'essay')),
      content TEXT NOT NULL,
      options JSON,
      answer JSON NOT NULL,
      explanation TEXT,
      difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
      score INT DEFAULT 5,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedPaperQuestions() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS paper_questions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
      sort_order INT DEFAULT 0,
      score INT,
      UNIQUE(paper_id, question_id)
    );
  `;
}

async function seedExamAttempts() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
      score INT,
      status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      submitted_at TIMESTAMP,
      graded_at TIMESTAMP,
      answers JSON
    );
  `;
}

async function seedMaterials() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS materials (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
      title VARCHAR(200) NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('PDF', 'PPT', 'DOC', 'IMAGE', 'VIDEO')),
      file_url VARCHAR(500) NOT NULL,
      file_size BIGINT DEFAULT 0,
      downloads INT DEFAULT 0,
      view_count INT DEFAULT 0,
      uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedLiveClasses() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS live_classes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
      teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      scheduled_at TIMESTAMP NOT NULL,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
      meeting_url VARCHAR(500),
      max_participants INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedClassRecordings() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS class_recordings (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      duration INT DEFAULT 0,
      video_url VARCHAR(500),
      view_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedChannels() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS channels (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      type VARCHAR(50) DEFAULT 'public' CHECK (type IN ('public', 'private')),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedChatMessages() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedAiRoles() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS ai_roles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  `;

  const insertedRoles = await Promise.all(
    aiRoles.map((role) =>
      sql`
        INSERT INTO ai_roles (id, name, slug, subtitle, description, system_prompt, greeting, icon, color, is_active, sort_order)
        VALUES (${role.id}, ${role.name}, ${role.slug}, ${role.subtitle}, ${role.description}, ${role.system_prompt}, ${role.greeting}, ${role.icon}, ${role.color}, ${role.is_active}, ${role.sort_order})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedRoles;
}

async function seedAiConversations() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES ai_roles(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedAiMessages() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedAnnouncements() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'notice' CHECK (type IN ('exam', 'homework', 'notice', 'live')),
      priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
      target_all BOOLEAN DEFAULT true,
      published_by UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );
  `;
}

async function seedUserAnnouncements() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS user_announcements (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMP,
      UNIQUE(user_id, announcement_id)
    );
  `;
}

export async function GET() {
  try {
    await seedUsers();
    await seedCategories();
    await seedCourses();
    await seedChapters();
    await seedEnrollments();
    await seedChapterProgress();
    await seedExamPapers();
    await seedQuestions();
    await seedPaperQuestions();
    await seedExamAttempts();
    await seedMaterials();
    await seedLiveClasses();
    await seedClassRecordings();
    await seedChannels();
    await seedChatMessages();
    await seedAiRoles();
    await seedAiConversations();
    await seedAiMessages();
    await seedAnnouncements();
    await seedUserAnnouncements();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
