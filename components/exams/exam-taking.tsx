"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, XCircle, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createExamAttempt, updateExamAttempt } from "@/lib/exam-actions"
import type { Exam, ExamQuestion, QuestionBank } from "@/lib/definitions"

const parseOptions = (opts: any): { id: string; text: string }[] | null => {
  if (!opts) return null
  
  // If it's already an array
  if (Array.isArray(opts)) {
    const result = opts.map((opt: any, idx: number) => {
      const id = opt.id ?? opt.value ?? opt.key ?? String(idx + 1)
      const text = opt.text ?? opt.label ?? opt.value ?? opt.name ?? String(opt) ?? ''
      return { id: String(id), text: String(text) }
    }).filter((opt: any) => opt.text)
    return result.length > 0 ? result : null
  }
  
  // If it's a string, try to parse as JSON
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts)
      if (Array.isArray(parsed)) {
        const result = parsed.map((opt: any, idx: number) => {
          const id = opt.id ?? opt.value ?? opt.key ?? String(idx + 1)
          const text = opt.text ?? opt.label ?? opt.value ?? opt.name ?? String(opt) ?? ''
          return { id: String(id), text: String(text) }
        }).filter((opt: any) => opt.text)
        return result.length > 0 ? result : null
      }
      // If it's a string like "A,B,C,D", split it
      if (opts.includes(',')) {
        return opts.split(',').map((opt: string, idx: number) => ({
          id: String(idx + 1),
          text: opt.trim()
        }))
      }
    } catch {
      // If parsing fails, return null
    }
  }
  
  return null
}

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  fill_blank: "填空题",
  short_answer: "简答题",
  essay: "论述题",
  true_false: "是非题"
}

interface ExamTakingProps {
  exam: Exam & { questions: ExamQuestion[] }
  userId: string
}

export function ExamTaking({ exam, userId }: ExamTakingProps) {
  const router = useRouter()
  const questions = exam.questions.map(eq => eq.question).filter(Boolean) as (QuestionBank & { score: number; sort_order: number })[]
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // 处理答案选择
  const handleAnswer = (questionId: string, optionId: string, questionType: string) => {
    if (questionType === 'multi_choice') {
      // 多选题 - 切换选择
      setAnswers(prev => {
        const current = prev[questionId] || []
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) }
        } else {
          return { ...prev, [questionId]: [...current, optionId] }
        }
      })
    } else {
      // 单选题/其他 - 单选
      setAnswers(prev => ({ ...prev, [questionId]: [optionId] }))
    }
  }

  // 检查是否选中
  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const selected = answers[questionId] || []
    return selected.includes(optionId)
  }

  useEffect(() => {
    const initAttempt = async () => {
      const attempt = await createExamAttempt({
        exam_id: exam.id,
        user_id: userId,
        total_score: exam.total_score
      })
      if (attempt) {
        setAttemptId(attempt.id)
      }
    }
    initAttempt()
  }, [exam.id, userId, exam.total_score])

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const checkAnswerEqual = (userAnswers: string[] | undefined, correctAnswer: any, question: QuestionBank & { score: number; sort_order: number }): boolean => {
    if (!userAnswers || userAnswers.length === 0) return false
    if (!correctAnswer) return false
    
    const options = parseOptions(question.options) as { id: string; text: string }[] | null
    
    const getOptionLetter = (optionId: string): string => {
      if (!options) return optionId
      let idx = options.findIndex(o => String(o.id) === String(optionId))
      if (idx < 0) {
        idx = options.findIndex(o => o.text.toLowerCase() === optionId.toLowerCase())
      }
      if (idx < 0) {
        const num = parseInt(optionId)
        if (!isNaN(num) && num > 0 && num <= options.length) {
          idx = num - 1
        }
      }
      if (idx >= 0) {
        return String.fromCharCode(65 + idx)
      }
      return String(optionId).toUpperCase()
    }
    
    const userSet = new Set(userAnswers.map(a => getOptionLetter(a)))
    
    let correctValues: string[] = []
    
    if (typeof correctAnswer === 'string') {
      correctValues = [correctAnswer]
    } else if (Array.isArray(correctAnswer)) {
      correctValues = correctAnswer.map((a: any) => String(a.id ?? a))
    } else if (typeof correctAnswer === 'object' && correctAnswer !== null) {
      correctValues = [String(correctAnswer.id ?? correctAnswer.value ?? JSON.stringify(correctAnswer))]
    }
    
    if (correctValues.length === 0) return false
    
    const correctSet = new Set(correctValues.map(c => c.toLowerCase()))
    
    if (userSet.size !== correctSet.size) return false
    
    for (const val of correctSet) {
      if (!userSet.has(val)) return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    console.log('=== Handle Submit Called ===')
    console.log('attemptId:', attemptId)
    console.log('answers:', answers)
    
    let correctCount = 0
    let totalScore = 0
    
    questions.forEach(q => {
      const userAnswer = answers[q.id] || []
      const correctAnswer = q.answer
      console.log(`Question ${q.id}:`)
      console.log('  - User answer:', userAnswer)
      console.log('  - Correct answer:', correctAnswer)
      console.log('  - Options:', q.options)
      
      if (checkAnswerEqual(userAnswer, correctAnswer, q)) {
        correctCount++
        totalScore += q.score
      }
    })

    console.log('Correct count:', correctCount, 'Total score:', totalScore)

    if (attemptId) {
      console.log('Updating exam attempt with attemptId:', attemptId)
      const result = await updateExamAttempt(attemptId, {
        answers,
        score: totalScore,
        status: "submitted"
      })
      console.log('Update result:', result)
    } else {
      console.error('No attemptId found!')
    }

    setIsSubmitted(true)
  }

  const handleViewResult = () => {
    router.push(`/exams?tab=papers&result=${attemptId}`)
  }

  if (questions.length === 0) {
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">该试卷暂无题目</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    let correctCount = 0
    questions.forEach(q => {
      const userAnswer = answers[q.id] || []
      const correctAnswer = q.answer
      if (checkAnswerEqual(userAnswer, correctAnswer, q)) {
        correctCount++
      }
    })
    
    const score = Math.round((correctCount / questions.length) * 100)
    
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/exams")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回列表
        </Button>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full mx-auto",
              score >= 60 ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"
            )}>
              <Award className="w-10 h-10" />
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">{score}</p>
              <p className="text-sm text-muted-foreground mt-1">总分 100 分</p>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-[hsl(var(--success))]">
                <CheckCircle className="w-4 h-4" /> 正确 {correctCount} 题
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-4 h-4" /> 错误 {questions.length - correctCount} 题
              </span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold text-foreground">答题详情</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id] || []
            const correctAnswer = q.answer
            const isCorrect = checkAnswerEqual(userAnswer, correctAnswer, q)
            
            const options = parseOptions(q.options) as { id: string; text: string }[] | null
            const getAnswerText = (answerId: string) => {
              if (!options) return answerId
              const opt = options.find(o => o.id === answerId || String(o.id) === answerId)
              if (opt) return opt.text
              const strId = String(answerId).toUpperCase()
              const idx = strId.charCodeAt(0) - 65
              if (idx >= 0 && idx < options.length) {
                return options[idx].text
              }
              return answerId
            }

            return (
              <Card key={q.id} className={cn("border-border/50 shadow-sm", isCorrect ? "border-l-4 border-l-[hsl(var(--success))]" : "border-l-4 border-l-destructive")}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                    <p className="text-sm text-foreground">{i + 1}. {q.title}</p>
                  </div>
                  <div className="ml-6 text-xs space-y-1">
                    <p className="text-muted-foreground">
                      你的答案: <span className={isCorrect ? "text-[hsl(var(--success))]" : "text-destructive"}>
                        {userAnswer && userAnswer.length > 0 
                          ? userAnswer.map(a => getAnswerText(a)).join(", ") 
                          : "未作答"}
                      </span>
                    </p>
                    {!isCorrect && correctAnswer && (
                      <p className="text-[hsl(var(--success))]">
                        正确答案: {Array.isArray(correctAnswer) 
                          ? correctAnswer.map(a => getAnswerText(typeof a === "object" ? a.id : a)).join(", ")
                          : getAnswerText(correctAnswer)
                        }
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const q = questions[currentQuestion]
  const options = parseOptions(q?.options) as { id: string; text: string }[] | null

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 pt-16 md:pt-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              if (confirm("确定要退出吗？退出后将丢失答题进度")) {
                router.push("/exams")
              }
            }} 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> 退出考试
          </button>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-medium text-foreground">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>第 {currentQuestion + 1} / {questions.length} 题</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Badge variant="secondary" className="text-xs mb-3">{q.score}分 · {typeLabels[q.type] || q.type}</Badge>
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">{q.title}</h2>
          </div>

          {/* 是非题 */}
          {q.type === 'true_false' && (
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(q.id, 'true')}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isOptionSelected(q.id, 'true')
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                  isOptionSelected(q.id, 'true')
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  ✓
                </span>
                <span className="text-sm">正确</span>
              </button>
              <button
                onClick={() => handleAnswer(q.id, 'false')}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isOptionSelected(q.id, 'false')
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                  isOptionSelected(q.id, 'false')
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  ✗
                </span>
                <span className="text-sm">错误</span>
              </button>
            </div>
          )}

          {/* 填空题、简答题、论述题 - 文本框 */}
          {(q.type === 'fill_blank' || q.type === 'short_answer' || q.type === 'essay') && (
            <div className="space-y-3">
              <textarea
                value={(answers[q.id] || []).join('')}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: [e.target.value] }))}
                placeholder={q.type === 'fill_blank' ? '请输入答案' : '请输入您的回答'}
                className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          )}

          {/* 选择题（单选、多选）- 显示选项 */}
          {options && options.length > 0 && (
            <div className="space-y-3">
              {options.map((opt, oi) => {
                const isSelected = isOptionSelected(q.id, opt.id)
                const isMulti = q.type === 'multi_choice'
                return (
                <button
                  key={opt.id || oi}
                  onClick={() => handleAnswer(q.id, opt.id, q.type)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center text-sm font-medium shrink-0",
                    isMulti 
                      ? "w-6 h-6 rounded-md border-2" 
                      : "w-8 h-8 rounded-full",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border"
                  )}>
                    {isMulti ? (
                      <span className="text-xs">{isSelected ? '✓' : ''}</span>
                    ) : (
                      String.fromCharCode(65 + oi)
                    )}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </button>
              )})}
              {q.type === 'multi_choice' && (
                <p className="text-xs text-muted-foreground">提示：多选题，可选择一个或多个选项</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border bg-card shrink-0">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            上一题
          </button>
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              下一题
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-sm font-medium hover:opacity-90 transition-colors"
            >
              提交试卷
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
