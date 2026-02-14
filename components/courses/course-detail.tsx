"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Users, Star, Play, CheckCircle, Lock, FileText, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const courseData: Record<string, {
  name: string; teacher: string; students: number; rating: number; hours: number; description: string; tags: string[]; progress: number
  chapters: { title: string; lessons: { title: string; duration: string; completed: boolean; locked: boolean }[] }[]
  knowledgePoints: { title: string; description: string }[]
}> = {
  "1": {
    name: "高等数学", teacher: "张教授", students: 320, rating: 4.8, hours: 64, progress: 72,
    description: "本课程涵盖一元函数微积分、多元函数微积分、微分方程、无穷级数等核心内容。通过系统学习，帮助学生建立扎实的数学基础，培养抽象思维和逻辑推理能力。",
    tags: ["必修", "基础"],
    chapters: [
      { title: "第一章 函数与极限", lessons: [
        { title: "1.1 函数的概念", duration: "45分钟", completed: true, locked: false },
        { title: "1.2 数列的极限", duration: "50分钟", completed: true, locked: false },
        { title: "1.3 函数的极限", duration: "40分钟", completed: true, locked: false },
      ]},
      { title: "第二章 导数与微分", lessons: [
        { title: "2.1 导数的定义", duration: "55分钟", completed: true, locked: false },
        { title: "2.2 求导法则", duration: "50分钟", completed: true, locked: false },
        { title: "2.3 高阶导数", duration: "45分钟", completed: false, locked: false },
      ]},
      { title: "第三章 微分中值定理", lessons: [
        { title: "3.1 中值定理", duration: "60分钟", completed: false, locked: false },
        { title: "3.2 洛必达法则", duration: "45分钟", completed: false, locked: false },
        { title: "3.3 泰勒公式", duration: "55分钟", completed: false, locked: true },
      ]},
    ],
    knowledgePoints: [
      { title: "极限理论", description: "理解epsilon-delta定义，掌握极限的运算法则" },
      { title: "导数与微分", description: "导数的几何意义与物理意义，基本求导法则" },
      { title: "积分学", description: "不定积分与定积分的概念和计算方法" },
      { title: "微分方程", description: "常见微分方程的求解方法与应用" },
    ],
  },
}

const defaultCourse = {
  name: "课程详情", teacher: "教授", students: 200, rating: 4.5, hours: 48, progress: 50,
  description: "这是一门精心设计的课程，涵盖该领域的核心知识点和实践技能。",
  tags: ["精选"], chapters: [
    { title: "第一章 基础入门", lessons: [
      { title: "1.1 课程概述", duration: "30分钟", completed: true, locked: false },
      { title: "1.2 基本概念", duration: "45分钟", completed: false, locked: false },
    ]}
  ],
  knowledgePoints: [
    { title: "核心概念", description: "掌握本课程的核心理论基础" },
    { title: "实践应用", description: "将理论知识应用到实际场景" },
  ],
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = courseData[courseId] || defaultCourse
  const [activeTab, setActiveTab] = useState("chapters")

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                <h1 className="text-xl font-bold text-foreground">{course.name}</h1>
                {course.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <span>{course.teacher}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.hours}课时</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.students}人在学</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />{course.rating}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{course.progress}%</span>
                <p className="text-xs text-muted-foreground">学习进度</p>
              </div>
              <Progress value={course.progress} className="w-32 h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="chapters">课程章节</TabsTrigger>
          <TabsTrigger value="knowledge">知识点</TabsTrigger>
          <TabsTrigger value="resources">课程资料</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4 space-y-4">
          {course.chapters.map((chapter, ci) => (
            <Card key={ci} className="border-border/50 shadow-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground">{chapter.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{chapter.lessons.length} 节课</p>
                </div>
                {chapter.lessons.map((lesson, li) => (
                  <div key={li} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-secondary/30 transition-colors">
                    {lesson.completed ? (
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
                    ) : lesson.locked ? (
                      <Lock className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                    ) : (
                      <Play className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <span className={`text-sm flex-1 ${lesson.locked ? "text-muted-foreground/50" : "text-foreground"}`}>
                      {lesson.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {course.knowledgePoints.map((kp, i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{kp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{kp.description}</p>
                      <Link href="/ai-tutor" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                        AI辅导 <Brain className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <div className="space-y-3">
            {["课程大纲.pdf", "第一章讲义.pdf", "第二章讲义.pdf", "习题集.pdf", "参考资料汇总.zip"].map((file, i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground flex-1">{file}</span>
                  <button className="text-xs text-primary hover:underline">下载</button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
