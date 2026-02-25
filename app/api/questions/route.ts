import { NextResponse } from 'next/server';
import { getAllQuestions, createQuestion, getCourseList } from '@/lib/exams';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    
    const questions = await getAllQuestions(courseId || undefined);
    const courses = await getCourseList();
    
    return NextResponse.json({ questions, courses });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const question = await createQuestion({
      course_id: body.course_id || null,
      type: body.type,
      content: body.content,
      options: body.options || null,
      answer: body.answer,
      explanation: body.explanation || null,
      difficulty: body.difficulty || 'medium',
      score: body.score || 5,
      sort_order: body.sort_order || 0,
    });
    
    if (!question) {
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
