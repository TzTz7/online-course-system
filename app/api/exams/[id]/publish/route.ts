import { NextResponse } from 'next/server';
import { publishExamPaper } from '@/lib/exams';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paper = await publishExamPaper(id);
    
    if (!paper) {
      return NextResponse.json({ error: 'Failed to publish exam paper' }, { status: 500 });
    }
    
    return NextResponse.json(paper);
  } catch (error) {
    console.error('Failed to publish exam paper:', error);
    return NextResponse.json({ error: 'Failed to publish exam paper' }, { status: 500 });
  }
}
