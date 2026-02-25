import { NextResponse } from 'next/server';
import { submitExam, getExamPaperById, getQuestionsByPaper, gradeExam, startExam } from '@/lib/exams';

function checkAnswerEqual(userAnswers: string[], correctAnswer: any): boolean {
  if (!userAnswers || userAnswers.length === 0) return false
  if (!correctAnswer) return false
  
  let correctValues: string[] = []
  
  if (typeof correctAnswer === 'string') {
    correctValues = [correctAnswer]
  } else if (Array.isArray(correctAnswer)) {
    correctValues = correctAnswer.map((a: any) => String(a.id ?? a))
  } else if (typeof correctAnswer === 'object' && correctAnswer !== null) {
    correctValues = [String(correctAnswer.id ?? correctAnswer.value)]
  }
  
  if (correctValues.length === 0) return false
  
  const userSet = new Set(userAnswers.map(u => u.toLowerCase()))
  const correctSet = new Set(correctValues.map(c => c.toLowerCase()))
  
  if (userSet.size !== correctSet.size) return false
  
  for (const val of correctSet) {
    if (!userSet.has(val)) return false
  }
  
  return true
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (body.action === 'start') {
      const attempt = await startExam(body.userId, id);
      if (!attempt) {
        return NextResponse.json({ error: 'Failed to start exam' }, { status: 500 });
      }
      return NextResponse.json(attempt);
    }
    
    const paper = await getExamPaperById(id);
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }
    
    const paperQuestions = await getQuestionsByPaper(id);
    
    let score = 0;
    for (const pq of paperQuestions) {
      const userAnswer = body.answers[pq.question_id] || [];
      const correctAnswer = pq.question?.answer;
      
      if (checkAnswerEqual(userAnswer, correctAnswer)) {
        score += pq.score;
      }
    }
    
    const attempt = await submitExam(body.attemptId, body.answers);
    
    if (attempt) {
      await gradeExam(attempt.id, score);
    }
    
    const correctCount = paperQuestions.filter(pq => {
      const userAnswer = body.answers[pq.question_id] || [];
      const correctAnswer = pq.question?.answer;
      return checkAnswerEqual(userAnswer, correctAnswer);
    }).length;
    
    return NextResponse.json({ 
      attempt: { ...attempt, score },
      correctCount,
      totalQuestions: paperQuestions.length
    });
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}
