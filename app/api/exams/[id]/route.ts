import { NextResponse } from 'next/server';
import { getExamPaperById, updateExamPaper, deleteExamPaper, publishExamPaper, getQuestionsByPaper } from '@/lib/exams';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paper = await getExamPaperById(id);
    
    if (!paper) {
      return NextResponse.json({ error: 'Exam paper not found' }, { status: 404 });
    }
    
    const questions = await getQuestionsByPaper(id);
    
    return NextResponse.json({ ...paper, questions });
  } catch (error) {
    console.error('Failed to fetch exam paper:', error);
    return NextResponse.json({ error: 'Failed to fetch exam paper' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const paper = await updateExamPaper(id, {
      title: body.title,
      course_id: body.course_id,
      description: body.description,
      time_limit: body.time_limit,
      total_score: body.total_score,
      passing_score: body.passing_score,
      difficulty: body.difficulty,
      status: body.status,
      scheduled_at: body.scheduled_at,
    });
    
    if (!paper) {
      return NextResponse.json({ error: 'Failed to update exam paper' }, { status: 500 });
    }
    
    return NextResponse.json(paper);
  } catch (error) {
    console.error('Failed to update exam paper:', error);
    return NextResponse.json({ error: 'Failed to update exam paper' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteExamPaper(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete exam paper' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete exam paper:', error);
    return NextResponse.json({ error: 'Failed to delete exam paper' }, { status: 500 });
  }
}
