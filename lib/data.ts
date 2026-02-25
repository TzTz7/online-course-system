import { sql } from './db';
import type { User, Category, Course, QuestionBank, Exam, ExamQuestion, ExamAttempt } from './definitions';

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await sql<Category[]>`
      SELECT id, name, slug, description, icon, sort_order, created_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `;
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export interface GetCoursesParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface CoursesResult {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getCourses({
  search,
  categoryId,
  page = 1,
  limit = 6
}: GetCoursesParams = {}): Promise<CoursesResult> {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = search ? `%${search}%` : null;
    
    let courses: Course[] = [];
    let total = 0;

    if (search && categoryId) {
      const [countResult, courseResults] = await Promise.all([
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text as count 
          FROM courses c 
          WHERE (c.title ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern})
            AND c.category_id = ${categoryId}
        `,
        sql<Course[]>`
          SELECT 
            c.id, c.title, c.slug, c.description, c.teacher_id, c.category_id,
            c.cover_image, c.created_at, c.updated_at,
            u.name as teacher_name,
            cat.name as category_name
          FROM courses c
          LEFT JOIN users u ON c.teacher_id = u.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          WHERE (c.title ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern})
            AND c.category_id = ${categoryId}
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      ]);
      courses = courseResults;
      total = parseInt(countResult[0]?.count || '0', 10);
    } else if (search) {
      const [countResult, courseResults] = await Promise.all([
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text as count 
          FROM courses c 
          WHERE c.title ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern}
        `,
        sql<Course[]>`
          SELECT 
            c.id, c.title, c.slug, c.description, c.teacher_id, c.category_id,
            c.cover_image, c.created_at, c.updated_at,
            u.name as teacher_name,
            cat.name as category_name
          FROM courses c
          LEFT JOIN users u ON c.teacher_id = u.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          WHERE c.title ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern}
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      ]);
      courses = courseResults;
      total = parseInt(countResult[0]?.count || '0', 10);
    } else if (categoryId) {
      const [countResult, courseResults] = await Promise.all([
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text as count 
          FROM courses c 
          WHERE c.category_id = ${categoryId}
        `,
        sql<Course[]>`
          SELECT 
            c.id, c.title, c.slug, c.description, c.teacher_id, c.category_id,
            c.cover_image, c.created_at, c.updated_at,
            u.name as teacher_name,
            cat.name as category_name
          FROM courses c
          LEFT JOIN users u ON c.teacher_id = u.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          WHERE c.category_id = ${categoryId}
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      ]);
      courses = courseResults;
      total = parseInt(countResult[0]?.count || '0', 10);
    } else {
      const [countResult, courseResults] = await Promise.all([
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text as count FROM courses c
        `,
        sql<Course[]>`
          SELECT 
            c.id, c.title, c.slug, c.description, c.teacher_id, c.category_id,
            c.cover_image, c.created_at, c.updated_at,
            u.name as teacher_name,
            cat.name as category_name
          FROM courses c
          LEFT JOIN users u ON c.teacher_id = u.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      ]);
      courses = courseResults;
      total = parseInt(countResult[0]?.count || '0', 10);
    }

    const totalPages = Math.ceil(total / limit);

    return {
      courses,
      total,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return {
      courses: [],
      total: 0,
      page,
      totalPages: 0
    };
  }
}

export async function getQuestions(params: { courseId?: string; type?: string; page?: number; limit?: number } = {}): Promise<{ questions: QuestionBank[]; total: number; page: number; totalPages: number }> {
  const { courseId, type, page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  try {
    let whereConditions = "1=1";
    const conditions: string[] = [];
    if (courseId) conditions.push(`q.course_id = '${courseId}'`);
    if (type) conditions.push(`q.type = '${type}'`);
    if (conditions.length > 0) whereConditions = conditions.join(" AND ");

    const [countResult, questions] = await Promise.all([
      sql<{ count: string }[]>`SELECT COUNT(*)::text as count FROM questions q WHERE ${sql(whereConditions)}`,
      sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE ${sql(whereConditions)}
        ORDER BY q.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    ]);

    const total = parseInt(countResult[0]?.count || '0', 10);
    return {
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return { questions: [], total: 0, page, totalPages: 0 };
  }
}

export async function getExams(params: { courseId?: string; status?: string; page?: number; limit?: number } = {}): Promise<{ exams: Exam[]; total: number; page: number; totalPages: number }> {
  const { courseId, status, page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  try {
    let whereConditions = "e.status = 'published'";
    const conditions: string[] = [];
    if (courseId) conditions.push(`e.course_id = '${courseId}'`);
    if (status) conditions.push(`e.status = '${status}'`);
    if (conditions.length > 0) whereConditions = conditions.join(" AND ");

    const [countResult, exams] = await Promise.all([
      sql<{ count: string }[]>`SELECT COUNT(*)::text as count FROM exams e WHERE ${sql(whereConditions)}`,
      sql<Exam[]>`
        SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
               e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
               c.title as course_name, u.name as creator_name
        FROM exams e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE ${sql(whereConditions)}
        ORDER BY e.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    ]);

    const total = parseInt(countResult[0]?.count || '0', 10);
    return {
      exams,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Failed to fetch exams:', error);
    return { exams: [], total: 0, page, totalPages: 0 };
  }
}

export async function getExamById(examId: string): Promise<Exam & { questions: ExamQuestion[] } | null> {
  try {
    const exams = await sql<Exam[]>`
      SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
             e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
             c.title as course_name, u.name as creator_name
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ${examId}
    `;

    if (!exams[0]) return null;

    const examQuestions = await sql<any[]>`
      SELECT eq.id, eq.exam_id, eq.question_id, eq.score, eq.sort_order, eq.created_at,
             q.id as q_id, q.course_id as q_course_id, q.type as q_type, q.title as q_title, 
             q.options as q_options, q.answer as q_answer, q.score as q_score, 
             q.created_at as q_created_at, q.updated_at as q_updated_at
      FROM exam_questions eq
      JOIN questions q ON eq.question_id = q.id
      WHERE eq.exam_id = ${examId}
      ORDER BY eq.sort_order
    `;

    const questions = examQuestions.map(eq => ({
      id: eq.id,
      exam_id: eq.exam_id,
      question_id: eq.question_id,
      score: eq.score,
      sort_order: eq.sort_order,
      created_at: eq.created_at,
      question: eq.q_id ? {
        id: eq.q_id,
        course_id: eq.q_course_id,
        type: eq.q_type,
        title: eq.q_title,
        options: eq.q_options,
        answer: eq.q_answer,
        score: eq.q_score,
        created_at: eq.q_created_at,
        updated_at: eq.q_updated_at
      } : undefined
    }));

    return { ...exams[0], questions };
  } catch (error) {
    console.error('Failed to fetch exam:', error);
    return null;
  }
}

export async function getExamAttempts(examId: string, userId?: string): Promise<ExamAttempt[]> {
  try {
    let attempts: ExamAttempt[] = [];
    if (userId) {
      attempts = await sql<ExamAttempt[]>`
        SELECT ea.id, ea.exam_id, ea.user_id, ea.start_time, ea.submit_time, ea.score, ea.total_score, 
               ea.status, ea.created_at, ea.updated_at
        FROM exam_attempts ea
        WHERE ea.exam_id = ${examId} AND ea.user_id = ${userId}
        ORDER BY ea.created_at DESC
      `;
    } else {
      attempts = await sql<ExamAttempt[]>`
        SELECT ea.id, ea.exam_id, ea.user_id, ea.start_time, ea.submit_time, ea.score, ea.total_score, 
               ea.status, ea.created_at, ea.updated_at, u.name as user_name
        FROM exam_attempts ea
        LEFT JOIN users u ON ea.user_id = u.id
        WHERE ea.exam_id = ${examId}
        ORDER BY ea.created_at DESC
      `;
    }
    return attempts;
  } catch (error) {
    console.error('Failed to fetch exam attempts:', error);
    return [];
  }
}
