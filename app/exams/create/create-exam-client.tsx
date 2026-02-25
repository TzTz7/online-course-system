"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X, Check, Shuffle, RefreshCw, FileText, Save, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createExam, fetchQuestions, fetchCourses, randomSelectQuestions } from "@/lib/exam-actions"
import type { QuestionBank } from "@/lib/definitions"
import { cn } from "@/lib/utils"

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  fill_blank: "填空题",
  short_answer: "简答题",
  essay: "论述题",
  true_false: "是非题"
}

const questionTypes = [
  { value: "single_choice", label: "单选题" },
  { value: "multi_choice", label: "多选题" },
  { value: "fill_blank", label: "填空题" },
  { value: "short_answer", label: "简答题" },
  { value: "essay", label: "论述题" },
  { value: "true_false", label: "是非题" }
]

interface Course {
  id: string
  title: string
}

interface CreateExamClientProps {
  userId: string
}

export function CreateExamClient({ userId }: CreateExamClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<QuestionBank[]>([])
  const [mode, setMode] = useState<"manual" | "random">("random")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [randomCounts, setRandomCounts] = useState<Record<string, number>>({
    single_choice: 5,
    multi_choice: 3,
    fill_blank: 2,
    short_answer: 2,
    essay: 1,
    true_false: 2
  })
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: "",
    duration: 90,
    total_score: 100,
    shuffle_questions: false,
    start_time: "",
    end_time: "",
    status: "draft"
  })

  useEffect(() => {
    const loadData = async () => {
      const [coursesData, questionsData] = await Promise.all([
        fetchCourses(),
        fetchQuestions({ limit: 500 })
      ])
      setCourses(coursesData)
      setQuestions(questionsData)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleRandomSelect = async () => {
    const selected = await randomSelectQuestions({
      courseId: formData.course_id || undefined,
      counts: randomCounts
    })
    setSelectedQuestions(selected.map(q => q.id))
    setQuestions(selected)
  }

  const handleRandomCountChange = (type: string, value: string) => {
    const count = parseInt(value) || 0
    setRandomCounts(prev => ({ ...prev, [type]: count }))
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("请输入试卷标题")
      return
    }
    if (selectedQuestions.length === 0) {
      alert("请至少添加一道题目")
      return
    }
    
    setSaving(true)
    try {
      const result = await createExam({
        ...formData,
        course_id: formData.course_id || undefined,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        created_by: userId,
        question_ids: selectedQuestions
      })
      
      if (result) {
        router.push(`/exams/${result.id}`)
      } else {
        alert("创建失败")
      }
    } catch (error) {
      console.error("Failed to create exam:", error)
      alert("创建失败")
    } finally {
      setSaving(false)
    }
  }

  const selectedQuestionsList = questions.filter(q => selectedQuestions.includes(q.id))
  const totalScore = selectedQuestionsList.reduce((sum, q) => sum + (q.score || 5), 0)

  const totalRandomCount = Object.values(randomCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </Button>
        <h1 className="text-xl font-bold text-foreground">创建试卷</h1>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">试卷标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例如：高等数学期末测试"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">所属课程</Label>
              <select
                id="course"
                value={formData.course_id}
                onChange={e => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">不关联课程（从全部题目中抽取）</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">试卷描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="试卷说明..."
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">考试时长（分钟）</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>随机题目顺序</Label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, shuffle_questions: !prev.shuffle_questions }))}
                className={cn(
                  "w-full h-10 flex items-center justify-center gap-2 rounded-md border text-sm",
                  formData.shuffle_questions 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-input bg-background text-muted-foreground"
                )}
              >
                <Shuffle className="w-4 h-4" />
                {formData.shuffle_questions ? "已启用" : "未启用"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">试卷题目</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("random")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  mode === "random"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                随机抽题
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  mode === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                手动选题
              </button>
            </div>
          </div>

          {mode === "random" ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                {questionTypes.map(type => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Label className="text-sm w-20 shrink-0">{type.label}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={randomCounts[type.value] || 0}
                      onChange={e => handleRandomCountChange(type.value, e.target.value)}
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground">题</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <Button onClick={handleRandomSelect}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  随机生成试卷
                </Button>
                <span className="text-sm text-muted-foreground">
                  共 {totalRandomCount} 题，预计 {totalRandomCount * 5} 分
                </span>
              </div>

              {selectedQuestions.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">已随机生成 {selectedQuestions.length} 道题目</span>
                    <Button variant="ghost" size="sm" onClick={handleRandomSelect}>
                      <RefreshCw className="w-3 h-3 mr-1" /> 重新生成
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      selectedQuestionsList.reduce((acc, q) => {
                        acc[q.type] = (acc[q.type] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <Badge key={type} variant="secondary">
                        {typeLabels[type] || type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>点击上方"手动选题"添加题目</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedQuestionsList.map((q, index) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        <div>
                          <p className="text-sm text-foreground">{q.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {typeLabels[q.type] || q.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{q.score || 5}分</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestion(q.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedQuestions.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                共 {selectedQuestions.length} 题
              </div>
              <div className="text-sm font-medium">
                总分：<span className="text-primary">{totalScore}</span> 分
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={saving || selectedQuestions.length === 0}>
          <Save className="w-4 h-4 mr-1" />
          {saving ? "保存中..." : "保存试卷"}
        </Button>
      </div>
    </div>
  )
}
