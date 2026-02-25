"use client"

import { useState, useEffect } from "react"
import { ExamTabs } from "./exam-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchQuestions, fetchExams } from "@/lib/exam-actions"
import type { QuestionBank, Exam } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExamsClientProps {
  initialTab: "papers" | "bank"
  userRole: "student" | "teacher" | "admin"
  userId: string
}

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

export function ExamsClient({ initialTab, userRole, userId }: ExamsClientProps) {
  const [tab, setTab] = useState<"papers" | "bank">(initialTab)
  const [exams, setExams] = useState<Exam[]>([])
  const [questions, setQuestions] = useState<QuestionBank[]>([])
  const [loading, setLoading] = useState(false)

  const loadPapers = async () => {
    setLoading(true)
    try {
      const data = await fetchExams({ limit: 50 })
      setExams(data)
    } catch (e) {
      console.error('Error loading exams:', e)
    }
    setLoading(false)
  }

  const loadBank = async () => {
    setLoading(true)
    try {
      const data = await fetchQuestions({ limit: 50 })
      setQuestions(data)
    } catch (e) {
      console.error('Error loading questions:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (tab === "papers") {
      loadPapers()
    } else {
      loadBank()
    }
  }, [tab])

  // Load data on initial render
  useEffect(() => {
    if (initialTab === "papers") {
      loadPapers()
    } else {
      loadBank()
    }
  }, [])

  const isTeacher = userRole === "teacher" || userRole === "admin"

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">考试题库</h1>
          <p className="text-muted-foreground mt-1">在线测评与练习，检验学习成果</p>
        </div>
        {isTeacher && (
          <Link
            href="/exams/create"
            className="shrink-0 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            创建试卷
          </Link>
        )}
      </div>

      <ExamTabs activeTab={tab} onTabChange={setTab} />

      {tab === "papers" ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {exams.length === 0 && !loading ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">暂无试卷</p>
            </div>
          ) : loading ? (
            <Skeleton className="h-32 col-span-2" />
          ) : (
            exams.map((exam) => (
              <ExamCard 
                key={exam.id} 
                exam={exam} 
                userId={userId}
                userRole={userRole}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无题库题目</p>
            </div>
          ) : loading ? (
            <Skeleton className="h-32" />
          ) : (
            questions.map((q) => (
              <QuestionCardWithAnswer key={q.id} question={q} isTeacher={isTeacher} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ExamCard({ exam, userId, userRole }: { exam: Exam; userId: string; userRole: string }) {
  const isTeacher = userRole === "teacher" || userRole === "admin"
  
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{exam.title}</h3>
          <Badge variant="secondary" className="text-xs">{exam.status}</Badge>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {exam.course_name && <span>{exam.course_name}</span>}
          <span>{exam.question_count}题</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{exam.duration}分钟
          </span>
          <span>{exam.total_score}分</span>
        </div>

        {userRole === "student" && (
          <Link
            href={`/exams/${exam.id}`}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center block"
          >
            开始考试
          </Link>
        )}

        {isTeacher && (
          <Link
            href={`/exams/${exam.id}`}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center block"
          >
            查看详情
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function QuestionCardWithAnswer({ question, isTeacher }: { question: QuestionBank; isTeacher: boolean }) {
  const [answer, setAnswer] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  
  const options = parseOptions(question.options) as { id: string; text: string }[] | null
  const correctAnswer = question.answer as { id: string }[] | string | null
  const hasOptions = options && Array.isArray(options) && options.length > 0
  const isStudent = !isTeacher

  const checkAnswer = () => {
    if (!answer.trim()) return
    setSubmitted(true)
  }

  const isCorrect = () => {
    if (!correctAnswer || !answer) return false
    if (typeof correctAnswer === 'string') {
      return answer.trim().toLowerCase() === correctAnswer.toLowerCase()
    }
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(a => a.id === answer || (a as any).id === answer)
    }
    return false
  }

  const getAnswerText = () => {
    if (!correctAnswer) return "暂无答案"
    if (typeof correctAnswer === "string") return correctAnswer
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map(a => {
        if (options) {
          const opt = options.find(o => o.id === a.id || o.id === a)
          return opt ? opt.text : a.id || a
        }
        return a.id || a
      }).join(", ")
    }
    return String(correctAnswer)
  }

  // 老师直接显示答案
  if (isTeacher) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="secondary" className="text-xs">{typeLabels[question.type] || question.type}</Badge>
                {question.course_name && (
                  <Badge variant="secondary" className="text-xs">{question.course_name}</Badge>
                )}
                <Badge variant="secondary" className="text-xs">{question.score}分</Badge>
              </div>
              <p className="text-sm text-foreground">{question.title}</p>
              
              {hasOptions && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {options.map((opt, oi) => (
                    <span 
                      key={opt.id || oi} 
                      className="text-xs text-muted-foreground px-3 py-1.5 bg-secondary rounded-lg"
                    >
                      {String.fromCharCode(65 + oi)}. {opt.text}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">正确答案: </span>
                  <span className="text-muted-foreground">{getAnswerText()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 学生做题界面
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="text-xs">{typeLabels[question.type] || question.type}</Badge>
              {question.course_name && (
                <Badge variant="secondary" className="text-xs">{question.course_name}</Badge>
              )}
              <Badge variant="secondary" className="text-xs">{question.score}分</Badge>
            </div>
            <p className="text-sm text-foreground mb-3">{question.title}</p>
            
            {!submitted ? (
              <>
                {/* 是非题 */}
                {question.type === 'true_false' && (
                  <div className="space-y-2 mb-3">
                    <button
                      onClick={() => setAnswer('true')}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                        answer === 'true'
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
                        answer === 'true'
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>✓</span>
                      <span className="text-sm">正确</span>
                    </button>
                    <button
                      onClick={() => setAnswer('false')}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                        answer === 'false'
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
                        answer === 'false'
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>✗</span>
                      <span className="text-sm">错误</span>
                    </button>
                  </div>
                )}

                {/* 填空题、简答题、论述题 */}
                {(question.type === 'fill_blank' || question.type === 'short_answer' || question.type === 'essay') && (
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="请输入答案"
                    className="mb-3"
                  />
                )}

                {/* 选择题 */}
                {hasOptions && (question.type === 'single_choice' || question.type === 'multi_choice') && (
                  <div className="space-y-2 mb-3">
                    {options.map((opt, oi) => (
                      <button
                        key={opt.id || oi}
                        onClick={() => setAnswer(opt.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          answer === opt.id
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        <span className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
                          answer === opt.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                <Button onClick={checkAnswer} disabled={!answer.trim()}>
                  提交答案
                </Button>
              </>
            ) : (
              /* 提交后显示结果 */
              <div className={cn(
                "p-4 rounded-xl border",
                isCorrect() ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect() ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={isCorrect() ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {isCorrect() ? "回答正确" : "回答错误"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">你的答案: </span>
                  <span className={isCorrect() ? "text-green-500" : "text-red-500"}>
                    {answer || "未作答"}
                  </span>
                </div>
                {!isCorrect() && (
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">正确答案: </span>
                    <span className="text-green-500">{getAnswerText()}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={() => { setSubmitted(false); setAnswer('') }}
                >
                  重新作答
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
