import { sql } from './db';
import type { ExamPaper, Question, ExamAttempt, PaperQuestion, ExamStatus, PaperStatus } from './definitions';

export async function getExamPapers(status?: PaperStatus): Promise<ExamPaper[]> {
  try {
    let query = sql<ExamPaper[]>`
      SELECT ep.*, c.title as course_name
      FROM exam_papers ep
      LEFT JOIN courses c ON ep.course_id = c.id
    `;
    
    if (status) {
      query = sql<ExamPaper[]>`
        SELECT ep.*, c.title as course_name
        FROM exam_papers ep
        LEFT JOIN courses c ON ep.course_id = c.id
        WHERE ep.status = ${status}
        ORDER BY ep.created_at DESC
      `;
    } else {
      query = sql<ExamPaper[]>`
        SELECT ep.*, c.title as course_name
        FROM exam_papers ep
        LEFT JOIN courses c ON ep.course_id = c.id
        ORDER BY ep.created_at DESC
      `;
    }
    
    return query;
  } catch (error) {
    console.error('Failed to fetch exam papers:', error);
    return [];
  }
}

export async function getExamPaperById(id: string): Promise<ExamPaper | null> {
  try {
    const papers = await sql<ExamPaper[]>`
      SELECT ep.*, c.title as course_name
      FROM exam_papers ep
      LEFT JOIN courses c ON ep.course_id = c.id
      WHERE ep.id = ${id}
    `;
    return papers[0] || null;
  } catch (error) {
    console.error('Failed to fetch exam paper:', error);
    return null;
  }
}

export async function getQuestionsByPaper(paperId: string): Promise<PaperQuestion[]> {
  try {
    const questions = await sql<PaperQuestion[]>`
      SELECT pq.*, 
             q.id as q_id, q.type as q_type, q.content as q_content, 
             q.options as q_options, q.answer as q_answer, 
             q.explanation as q_explanation, q.difficulty as q_difficulty,
             q.score as q_score, q.sort_order as q_sort_order, q.created_at as q_created_at
      FROM paper_questions pq
      JOIN questions q ON pq.question_id = q.id
      WHERE pq.paper_id = ${paperId}
      ORDER BY pq.sort_order
    `;
    
    return questions.map(pq => ({
      id: pq.id,
      paper_id: pq.paper_id,
      question_id: pq.question_id,
      sort_order: pq.sort_order,
      score: pq.score,
      question: {
        id: pq.q_id,
        course_id: null,
        type: pq.q_type,
        content: pq.q_content,
        options: pq.q_options,
        answer: pq.q_answer,
        explanation: pq.q_explanation,
        difficulty: pq.q_difficulty,
        score: pq.q_score,
        sort_order: pq.q_sort_order,
        created_at: pq.q_created_at
      }
    }));
  } catch (error) {
    console.error('Failed to fetch questions by paper:', error);
    return [];
  }
}

export async function createExamPaper(paper: Partial<ExamPaper>): Promise<ExamPaper | null> {
  try {
    const result = await sql<ExamPaper[]>`
      INSERT INTO exam_papers (title, course_id, description, time_limit, total_score, passing_score, difficulty, status, scheduled_at)
      VALUES (${paper.title}, ${paper.course_id}, ${paper.description}, ${paper.time_limit || 90}, ${paper.total_score || 100}, ${paper.passing_score || 60}, ${paper.difficulty || 'medium'}, ${paper.status || 'draft'}, ${paper.scheduled_at})
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create exam paper:', error);
    return null;
  }
}

export async function updateExamPaper(id: string, paper: Partial<ExamPaper>): Promise<ExamPaper | null> {
  try {
    const result = await sql<ExamPaper[]>`
      UPDATE exam_papers 
      SET title = COALESCE(${paper.title}, title),
          course_id = COALESCE(${paper.course_id}, course_id),
          description = COALESCE(${paper.description}, description),
          time_limit = COALESCE(${paper.time_limit}, time_limit),
          total_score = COALESCE(${paper.total_score}, total_score),
          passing_score = COALESCE(${paper.passing_score}, passing_score),
          difficulty = COALESCE(${paper.difficulty}, difficulty),
          status = COALESCE(${paper.status}, status),
          scheduled_at = COALESCE(${paper.scheduled_at}, scheduled_at)
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to update exam paper:', error);
    return null;
  }
}

export async function deleteExamPaper(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM exam_papers WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Failed to delete exam paper:', error);
    return false;
  }
}

export async function publishExamPaper(id: string): Promise<ExamPaper | null> {
  return updateExamPaper(id, { status: 'published' });
}

export async function getAllQuestions(courseId?: string): Promise<Question[]> {
  try {
    let questions: Question[];
    if (courseId) {
      questions = await sql<Question[]>`
        SELECT * FROM questions 
        WHERE course_id = ${courseId}
        ORDER BY sort_order
      `;
    } else {
      questions = await sql<Question[]>`
        SELECT * FROM questions 
        ORDER BY sort_order
      `;
    }
    return questions;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return [];
  }
}

export async function createQuestion(question: Partial<Question>): Promise<Question | null> {
  try {
    const result = await sql<Question[]>`
      INSERT INTO questions (course_id, type, content, options, answer, explanation, difficulty, score, sort_order)
      VALUES (${question.course_id}, ${question.type}, ${question.content}, ${question.options}, ${question.answer}, ${question.explanation}, ${question.difficulty || 'medium'}, ${question.score || 5}, ${question.sort_order || 0})
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to create question:', error);
    return null;
  }
}

export async function addQuestionToPaper(paperId: string, questionId: string, sortOrder: number, score: number): Promise<boolean> {
  try {
    await sql`
      INSERT INTO paper_questions (paper_id, question_id, sort_order, score)
      VALUES (${paperId}, ${questionId}, ${sortOrder}, ${score})
    `;
    return true;
  } catch (error) {
    console.error('Failed to add question to paper:', error);
    return false;
  }
}

export async function removeQuestionFromPaper(paperId: string, questionId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM paper_questions 
      WHERE paper_id = ${paperId} AND question_id = ${questionId}
    `;
    return true;
  } catch (error) {
    console.error('Failed to remove question from paper:', error);
    return false;
  }
}

export async function startExam(userId: string, paperId: string): Promise<ExamAttempt | null> {
  try {
    const result = await sql<ExamAttempt[]>`
      INSERT INTO exam_attempts (user_id, paper_id, status, answers)
      VALUES (${userId}, ${paperId}, 'in_progress', '{}')
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to start exam:', error);
    return null;
  }
}

export async function submitExam(attemptId: string, answers: Record<string, string | string[]>): Promise<ExamAttempt | null> {
  try {
    const result = await sql<ExamAttempt[]>`
      UPDATE exam_attempts 
      SET status = 'submitted', 
          answers = ${JSON.stringify(answers)},
          submitted_at = CURRENT_TIMESTAMP
      WHERE id = ${attemptId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return null;
  }
}

export async function gradeExam(attemptId: string, score: number): Promise<ExamAttempt | null> {
  try {
    const result = await sql<ExamAttempt[]>`
      UPDATE exam_attempts 
      SET status = 'graded', 
          score = ${score},
          graded_at = CURRENT_TIMESTAMP
      WHERE id = ${attemptId}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to grade exam:', error);
    return null;
  }
}

export async function getExamAttemptById(id: string): Promise<ExamAttempt | null> {
  try {
    const attempts = await sql<ExamAttempt[]>`
      SELECT ea.*, ep.title as paper_title
      FROM exam_attempts ea
      JOIN exam_papers ep ON ea.paper_id = ep.id
      WHERE ea.id = ${id}
    `;
    return attempts[0] || null;
  } catch (error) {
    console.error('Failed to fetch exam attempt:', error);
    return null;
  }
}

export async function getUserExamAttempts(userId: string): Promise<ExamAttempt[]> {
  try {
    const attempts = await sql<ExamAttempt[]>`
      SELECT ea.*, ep.title as paper_title
      FROM exam_attempts ea
      JOIN exam_papers ep ON ea.paper_id = ep.id
      WHERE ea.user_id = ${userId}
      ORDER BY ea.started_at DESC
    `;
    return attempts;
  } catch (error) {
    console.error('Failed to fetch user exam attempts:', error);
    return [];
  }
}

export async function getCourseList() {
  try {
    const courses = await sql`
      SELECT id, title FROM courses WHERE is_published = true ORDER BY title
    `;
    return courses;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}
