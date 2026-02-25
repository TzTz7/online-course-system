'use server'

import { sql } from './db'
import type { QuestionBank, Exam, ExamAttempt } from './definitions'

export async function fetchQuestions(params: { courseId?: string; type?: string; limit?: number } = {}): Promise<QuestionBank[]> {
  const { courseId, type, limit = 50 } = params

  try {
    if (courseId && type) {
      const questions = await sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE q.course_id = ${courseId} AND q.type = ${type}
        ORDER BY q.created_at DESC
        LIMIT ${limit}
      `
      return questions
    } else if (courseId) {
      const questions = await sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE q.course_id = ${courseId}
        ORDER BY q.created_at DESC
        LIMIT ${limit}
      `
      return questions
    } else if (type) {
      const questions = await sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE q.type = ${type}
        ORDER BY q.created_at DESC
        LIMIT ${limit}
      `
      return questions
    } else {
      const questions = await sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        ORDER BY q.created_at DESC
        LIMIT ${limit}
      `
      return questions
    }
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return []
  }
}

export async function fetchExams(params: { courseId?: string; status?: string; limit?: number } = {}): Promise<Exam[]> {
  const { courseId, status, limit = 50 } = params

  try {
    if (courseId && status) {
      const exams = await sql<Exam[]>`
        SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
               e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
               c.title as course_name, u.name as creator_name
        FROM exams e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.status = 'published' AND e.course_id = ${courseId} AND e.status = ${status}
        ORDER BY e.created_at DESC
        LIMIT ${limit}
      `
      return exams
    } else if (courseId) {
      const exams = await sql<Exam[]>`
        SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
               e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
               c.title as course_name, u.name as creator_name
        FROM exams e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.status = 'published' AND e.course_id = ${courseId}
        ORDER BY e.created_at DESC
        LIMIT ${limit}
      `
      return exams
    } else if (status) {
      const exams = await sql<Exam[]>`
        SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
               e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
               c.title as course_name, u.name as creator_name
        FROM exams e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.status = ${status}
        ORDER BY e.created_at DESC
        LIMIT ${limit}
      `
      return exams
    } else {
      const exams = await sql<Exam[]>`
        SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
               e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
               c.title as course_name, u.name as creator_name
        FROM exams e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.created_at DESC
        LIMIT ${limit}
      `
      return exams
    }
  } catch (error) {
    console.error('Failed to fetch exams:', error)
    return []
  }
}

export async function fetchExamById(examId: string): Promise<(Exam & { questions: any[] }) | null> {
  try {
    const exams = await sql<Exam[]>`
      SELECT e.id, e.title, e.description, e.course_id, e.duration, e.total_score, e.shuffle_questions, 
             e.question_count, e.start_time, e.end_time, e.status, e.created_by, e.created_at, e.updated_at,
             c.title as course_name, u.name as creator_name
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ${examId}
    `

    if (!exams[0]) return null

    const examQuestions = await sql<any[]>`
      SELECT eq.id, eq.exam_id, eq.question_id, eq.score, eq.sort_order, eq.created_at,
             q.id as q_id, q.course_id as q_course_id, q.type as q_type, q.title as q_title, 
             q.options as q_options, q.answer as q_answer, q.score as q_score, 
             q.created_at as q_created_at, q.updated_at as q_updated_at
      FROM exam_questions eq
      JOIN questions q ON eq.question_id = q.id
      WHERE eq.exam_id = ${examId}
      ORDER BY eq.sort_order
    `

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
    }))

    return { ...exams[0], questions }
  } catch (error) {
    console.error('Failed to fetch exam:', error)
    return null
  }
}

export async function fetchExamAttempts(examId: string, userId?: string): Promise<ExamAttempt[]> {
  try {
    let attempts: ExamAttempt[] = []
    if (userId) {
      attempts = await sql<ExamAttempt[]>`
        SELECT ea.id, ea.exam_id, ea.user_id, ea.start_time, ea.submit_time, ea.score, ea.total_score, 
               ea.status, ea.created_at, ea.updated_at
        FROM exam_attempts ea
        WHERE ea.exam_id = ${examId} AND ea.user_id = ${userId}
        ORDER BY ea.created_at DESC
      `
    } else {
      attempts = await sql<ExamAttempt[]>`
        SELECT ea.id, ea.exam_id, ea.user_id, ea.start_time, ea.submit_time, ea.score, ea.total_score, 
               ea.status, ea.created_at, ea.updated_at, u.name as user_name
        FROM exam_attempts ea
        LEFT JOIN users u ON ea.user_id = u.id
        WHERE ea.exam_id = ${examId}
        ORDER BY ea.created_at DESC
      `
    }
    return attempts
  } catch (error) {
    console.error('Failed to fetch exam attempts:', error)
    return []
  }
}

export async function createExamAttempt(data: { exam_id: string; user_id: string; total_score: number }): Promise<ExamAttempt | null> {
  try {
    const result = await sql<ExamAttempt[]>`
      INSERT INTO exam_attempts (exam_id, user_id, total_score, status, start_time)
      VALUES (${data.exam_id}, ${data.user_id}, ${data.total_score}, 'in_progress', NOW())
      RETURNING id, exam_id, user_id, start_time, submit_time, score, total_score, status, created_at, updated_at
    `
    console.log('Created exam attempt:', result[0]?.id)
    return result[0] || null
  } catch (error) {
    console.error('Failed to create exam attempt:', error)
    return null
  }
}

export async function updateExamAttempt(attemptId: string, data: { answers: Record<string, string[]>; score: number; status: string }): Promise<boolean> {
  try {
    await sql`
      UPDATE exam_attempts 
      SET score = ${data.score}, 
          status = ${data.status}, 
          submit_time = NOW(),
          updated_at = NOW()
      WHERE id = ${attemptId}
    `
    console.log('Updated exam attempt:', attemptId, 'with score:', data.score, 'status:', data.status)
    return true
  } catch (error) {
    console.error('Failed to update exam attempt:', error)
    return false
  }
}

export async function createExam(data: {
  title: string
  description?: string
  course_id?: string
  duration: number
  total_score: number
  shuffle_questions: boolean
  start_time?: string
  end_time?: string
  status: string
  created_by: string
  question_ids: string[]
}): Promise<Exam | null> {
  try {
    const result = await sql<Exam[]>`
      INSERT INTO exams (
        title, description, course_id, duration, total_score, 
        shuffle_questions, start_time, end_time, status, created_by, question_count
      )
      VALUES (
        ${data.title}, ${data.description || null}, ${data.course_id || null}, 
        ${data.duration}, ${data.total_score}, ${data.shuffle_questions},
        ${data.start_time ? new Date(data.start_time) : null}, 
        ${data.end_time ? new Date(data.end_time) : null},
        ${data.status}, ${data.created_by}, ${data.question_ids.length}
      )
      RETURNING id, title, description, course_id, duration, total_score, 
                shuffle_questions, question_count, start_time, end_time, 
                status, created_by, created_at, updated_at
    `
    
    const newExam = result[0]
    if (!newExam) return null
    
    if (data.question_ids.length > 0) {
      const examQuestions = data.question_ids.map((questionId, index) => {
        return sql`
          INSERT INTO exam_questions (exam_id, question_id, sort_order)
          VALUES (${newExam.id}, ${questionId}, ${index + 1})
        `
      })
      await Promise.all(examQuestions)
    }
    
    console.log('Created exam:', newExam.id)
    return newExam
  } catch (error) {
    console.error('Failed to create exam:', error)
    return null
  }
}

export async function fetchCourses(): Promise<{ id: string; title: string }[]> {
  try {
    const courses = await sql<{ id: string; title: string }[]>`
      SELECT id, title FROM courses ORDER BY title
    `
    return courses
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return []
  }
}

export async function fetchQuestionsByType(courseId?: string, type?: string, limit: number = 100): Promise<QuestionBank[]> {
  try {
    let query = sql<QuestionBank[]>`
      SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
      FROM questions q
      LEFT JOIN courses c ON q.course_id = c.id
      WHERE 1=1
    `
    
    if (courseId) {
      query = sql`${query} AND q.course_id = ${courseId}`
    }
    if (type) {
      query = sql`${query} AND q.type = ${type}`
    }
    
    query = sql`${query} ORDER BY RANDOM() LIMIT ${limit}`
    
    return query
  } catch (error) {
    console.error('Failed to fetch questions by type:', error)
    return []
  }
}

export async function randomSelectQuestions(params: {
  courseId?: string
  counts: Record<string, number>
}): Promise<QuestionBank[]> {
  try {
    const selectedQuestions: QuestionBank[] = []
    
    for (const [type, count] of Object.entries(params.counts)) {
      if (count <= 0) continue
      
      const questions = await sql<QuestionBank[]>`
        SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
        FROM questions q
        LEFT JOIN courses c ON q.course_id = c.id
        WHERE q.type = ${type}
        ${params.courseId ? sql`AND q.course_id = ${params.courseId}` : sql``}
        ORDER BY RANDOM()
        LIMIT ${count}
      `
      selectedQuestions.push(...questions)
    }
    
    return selectedQuestions
  } catch (error) {
    console.error('Failed to random select questions:', error)
    return []
  }
}
