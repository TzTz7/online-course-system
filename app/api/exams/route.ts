import { NextResponse } from 'next/server';
import { getExamPapers, createExamPaper, getCourseList } from '@/lib/exams';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    
    const papers = await getExamPapers(status || undefined);
    const courses = await getCourseList();
    
    return NextResponse.json({ papers, courses });
  } catch (error) {
    console.error('Failed to fetch exam papers:', error);
    return NextResponse.json({ error: 'Failed to fetch exam papers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paper = await createExamPaper({
      title: body.title,
      course_id: body.course_id || null,
      description: body.description || null,
      time_limit: body.time_limit || 90,
      total_score: body.total_score || 100,
      passing_score: body.passing_score || 60,
      difficulty: body.difficulty || 'medium',
      status: body.status || 'draft',
      scheduled_at: body.scheduled_at || null,
    });
    
    if (!paper) {
      return NextResponse.json({ error: 'Failed to create exam paper' }, { status: 500 });
    }
    
    return NextResponse.json(paper);
  } catch (error) {
    console.error('Failed to create exam paper:', error);
    return NextResponse.json({ error: 'Failed to create exam paper' }, { status: 500 });
  }
}
