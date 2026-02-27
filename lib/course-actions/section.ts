'use server'

import { sql } from '@/lib/db'

export type SectionDetail = {
  id: string
  title: string
  content_type: string
  content: string
  chapter_id: string
  course_id: string
}

export async function getSectionById(sectionId: string): Promise<SectionDetail | null> {
  try {
    const sections = await sql`
      SELECT s.id, s.title, s.content_type, s.content, s.chapter_id, c.course_id
      FROM sections s
      LEFT JOIN chapters c ON s.chapter_id = c.id
      WHERE s.id = ${sectionId}::uuid
    `

    if (sections.length === 0) {
      return null
    }

    return sections[0] as SectionDetail
  } catch (error) {
    console.error('Failed to get section:', error)
    return null
  }
}
