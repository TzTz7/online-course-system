"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, FileQuestion } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CourseWithChapters } from "@/lib/course-actions/chapters"

// 补充子类型定义（兼容原有类型）
type Chapter = {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
    content_type: 'video' | 'text' | string
  }>
}

type Course = {
  id: string
  title: string
  category_name?: string | null
  description?: string | null
  teacher_name?: string | null
}

// 类型兼容处理
interface CourseWithChaptersFix extends Omit<CourseWithChapters, 'course' | 'chapters'> {
  course: Course
  chapters: Chapter[] | null | undefined
}

export function CourseDetail({ data }: { data: CourseWithChaptersFix }) {
  // 解构时添加默认值，避免undefined
  const { course, chapters = [] } = data

  // 重构判断逻辑，增加空值校验
  const hasChapters = Array.isArray(chapters) && chapters.length > 0
  const hasSections = hasChapters && chapters.some(ch => Array.isArray(ch.sections) && ch.sections.length > 0)

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <Link 
        href="/courses" 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回课程中心
      </Link>

      {/* Course header */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-primary/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{course.title || '未命名课程'}</h1>
                {course.category_name && (
                  <Badge variant="secondary" className="text-xs">{course.category_name}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{course.description || '暂无课程描述'}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <span>教师：{course.teacher_name || '未知'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs - 修复括号/大括号嵌套错误 */}
      <Tabs defaultValue="chapters">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="chapters">课程章节</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4 space-y-4">
          {!hasSections ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <FileQuestion className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暂无章节内容</p>
                <p className="text-sm text-muted-foreground mt-1">请期待后续更新</p>
              </CardContent>
            </Card>
          ) : (
            // 修复：filter和map的括号嵌套，确保所有()/{}闭合
            chapters
              .filter((chapter) => Array.isArray(chapter.sections) && chapter.sections.length > 0)
              .map((chapter, ci) => (
                <Card key={chapter.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-border/50">
                      <h3 className="text-sm font-semibold text-foreground">{chapter.title || '未命名章节'}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Array.isArray(chapter.sections) ? chapter.sections.length : 0} 节
                      </p>
                    </div>
                    {/* 修复：sections遍历的括号/大括号 */}
                    {Array.isArray(chapter.sections) && chapter.sections.map((section, si) => (
                      <Link 
                        key={section.id} 
                        href={`/sections/${section.id}`}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      >
                        {section.content_type === 'video' ? (
                          <span className="text-lg shrink-0">🎥</span>
                        ) : (
                          <span className="text-lg shrink-0">📝</span>
                        )}
                        <span className="text-sm flex-1 text-foreground">
                          {section.title || '未命名小节'}
                        </span>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}