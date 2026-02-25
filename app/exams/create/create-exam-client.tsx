"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X, Check, RefreshCw, FileText, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createExam, fetchQuestions, fetchCourses, randomSelectQuestionsSimple } from "@/lib/exam-actions"
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
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [showQuestionPicker, setShowQuestionPicker] = useState(false)
  const [questionCount, setQuestionCount] = useState<number>(0)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: "",
    duration: 90
  })

  useEffect(() => {
    const loadData = async () => {
      const coursesData = await fetchCourses()
      setCourses(coursesData)
      setLoading(false)
    }
    loadData()
  }, [])

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleRandomGenerate = async () => {
    if (questionCount <= 0) {
      alert("请输入题目数量")
      return
    }
    
    const selected = await randomSelectQuestionsSimple(
      questionCount,
      formData.course_id || undefined
    )
    setQuestions(selected)
    setSelectedQuestions(selected.map(q => q.id))
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
        title: formData.title,
        description: formData.description,
        course_id: formData.course_id || undefined,
        duration: formData.duration,
        total_score: selectedQuestions.length * 5,
        shuffle_questions: false,
        status: "published",
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
                title="选择所属课程"
                value={formData.course_id}
                onChange={e => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">不关联课程</option>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">考试时长（分钟）</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">试卷题目</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="questionCount">题目数量</Label>
              <Input
                id="questionCount"
                type="number"
                min="0"
                value={questionCount}
                onChange={e => setQuestionCount(parseInt(e.target.value) || 0)}
                placeholder="输入数字"
              />
            </div>
            <div className="pt-6">
              <Button onClick={handleRandomGenerate}>
                <RefreshCw className="w-4 h-4 mr-1" />
                随机生成
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">或</div>

          <Button variant="outline" onClick={() => setShowQuestionPicker(true)}>
            <Plus className="w-4 h-4 mr-1" />
            手动选择题目
          </Button>

          {selectedQuestions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">已选择 {selectedQuestions.length} 道题目</span>
                <span className="text-sm text-muted-foreground">总分 {totalScore} 分</span>
              </div>
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
                  </div>
                ))}
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

      {showQuestionPicker && (
        <QuestionPicker
          courses={courses}
          courseId={formData.course_id}
          selectedIds={selectedQuestions}
          onToggle={toggleQuestion}
          onClose={() => setShowQuestionPicker(false)}
        />
      )}
    </div>
  )
}

function QuestionPicker({
  courses,
  courseId,
  selectedIds,
  onToggle,
  onClose
}: {
  courses: Course[]
  courseId: string
  selectedIds: string[]
  onToggle: (id: string) => void
  onClose: () => void
}) {
  const [questions, setQuestions] = useState<QuestionBank[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCourse, setFilterCourse] = useState(courseId)
  const [filterType, setFilterType] = useState("")

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      const data = await fetchQuestions({ 
        courseId: filterCourse || undefined,
        type: filterType || undefined,
        limit: 200 
      })
      setQuestions(data)
      setLoading(false)
    }
    loadQuestions()
  }, [filterCourse, filterType])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">选择题目</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-3">
            <select
              title="按课程筛选"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">全部课程</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              title="按题型筛选"
              onChange={e => setFilterType(e.target.value)}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">全部题型</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无题目</div>
            ) : (
              questions.map(q => {
                const isSelected = selectedIds.includes(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => onToggle(q.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeLabels[q.type] || q.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{q.score || 5}分</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center ml-3 shrink-0",
                      isSelected 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-border"
                    )}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              已选择 {selectedIds.length} 题
            </div>
            <Button onClick={onClose}>
              确认
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
