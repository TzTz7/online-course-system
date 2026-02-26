'use server'

import { sql } from './db'
import type { QuestionBank, Exam, ExamAttempt, QuestionType } from './definitions'
import { checkAnswer } from './exam/question-bank-logic'

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

export async function randomSelectQuestionsSimple(count: number, courseId?: string): Promise<QuestionBank[]> {
  try {
    if (count <= 0) return []
    
    const questions = await sql<QuestionBank[]>`
      SELECT q.id, q.course_id, q.type, q.title, q.options, q.answer, q.score, q.created_at, q.updated_at, c.title as course_name
      FROM questions q
      LEFT JOIN courses c ON q.course_id = c.id
      ${courseId ? sql`WHERE q.course_id = ${courseId}` : sql``}
      ORDER BY RANDOM()
      LIMIT ${count}
    `
    
    return questions
  } catch (error) {
    console.error('Failed to random select questions:', error)
    return []
  }
}

export async function submitExam(
  examId: string, 
  attemptId: string, 
  answers: Record<string, string[]>
): Promise<{ score: number; correctCount: number; totalQuestions: number }> {
  try {
    const examQuestions = await sql<{ id: string; question_id: string; score: number; answer: string; type: string }[]>`
      SELECT eq.id, eq.question_id, eq.score, q.answer, q.type
      FROM exam_questions eq
      JOIN questions q ON eq.question_id = q.id
      WHERE eq.exam_id = ${examId}
    `
    
    let score = 0
    let correctCount = 0
    
    for (const eq of examQuestions) {
      const userAnswerArr = answers[eq.question_id] || []
      const correctAnswer = eq.answer
      const questionType = eq.type as QuestionType
      
      // 调试日志
      console.log('Checking question:', eq.question_id, 'type:', questionType)
      console.log('User answer:', userAnswerArr, 'Correct answer:', correctAnswer)
      
      // 转换答案格式
      let answerToCheck = ""
      if (questionType === 'multiple_choice') {
        // 多选题：转换为 JSON 字符串
        answerToCheck = JSON.stringify(userAnswerArr)
      } else if (userAnswerArr.length > 0) {
        // 其他题型：取第一个答案
        answerToCheck = userAnswerArr[0]
      }
      
      const isCorrect = checkAnswer(answerToCheck, correctAnswer, questionType)
      console.log('Is correct:', isCorrect)
      
      if (isCorrect) {
        correctCount++
        score += eq.score
      }
    }
    
    await sql`
      UPDATE exam_attempts 
      SET score = ${score}, 
          status = 'submitted', 
          submit_time = NOW(),
          updated_at = NOW()
      WHERE id = ${attemptId}
    `
    
    return {
      score,
      correctCount,
      totalQuestions: examQuestions.length
    }
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return { score: 0, correctCount: 0, totalQuestions: 0 };
  }
}
