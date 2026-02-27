'use server'

import { sql } from '@/lib/db'

export type Chapter = {
  id: string
  title: string
  course_id: string
  sort_order: number
  sections: Section[]
}

export type Section = {
  id: string
  title: string
  content_type: string
  content: string
  chapter_id: string
  sort_order: number
}

export type CourseWithChapters = {
  course: {
    id: string
    title: string
    description: string | null
    teacher_name: string
    category_name: string | null
  }
  chapters: Chapter[]
}

export async function getCourseChapters(courseId: string): Promise<CourseWithChapters | null> {
  try {
    // 获取课程信息
    const courses = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description,
        c.teacher_id,
        c.category_id,
        u.name as teacher_name,
        cat.name as category_name
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ${courseId}
    `

    if (courses.length === 0) {
      return null
    }

    const course = courses[0]

    // 获取章节列表
    const chapters = await sql`
      SELECT id, title, course_id, sort_order
      FROM chapters
      WHERE course_id = ${courseId}
      ORDER BY sort_order ASC, title ASC
    `

    // 获取每个章节的小节
    const chapterIds = chapters.map(ch => ch.id)
    
    let sections: Section[] = []
    
    if (chapterIds.length > 0) {
      sections = await sql`
        SELECT id, title, content_type, content, chapter_id, sort_order
        FROM sections
        WHERE chapter_id IN ${sql(chapterIds)}
        ORDER BY chapter_id, sort_order ASC, title ASC
      `
    }

    // 将小节按章节分组
    const sectionsByChapter = new Map<string, Section[]>()
    sections.forEach(section => {
      if (!sectionsByChapter.has(section.chapter_id)) {
        sectionsByChapter.set(section.chapter_id, [])
      }
      sectionsByChapter.get(section.chapter_id)!.push(section)
    })

    // 组装章节数据
    const chaptersWithSections: Chapter[] = chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      course_id: chapter.course_id,
      sort_order: chapter.sort_order,
      sections: sectionsByChapter.get(chapter.id) || []
    }))

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        teacher_name: course.teacher_name,
        category_name: course.category_name
      },
      chapters: chaptersWithSections
    }
  } catch (error) {
    console.error('Failed to get course chapters:', error)
    return null
  }
}
