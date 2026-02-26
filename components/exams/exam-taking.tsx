"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, XCircle, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createExamAttempt, updateExamAttempt, submitExam } from "@/lib/exam-actions"
import type { Exam, ExamQuestion, QuestionBank, QuestionType } from "@/lib/definitions"
import { 
  checkAnswer, 
  parseQuestionOptions, 
  parseQuestionAnswer,
  questionTypeLabels 
} from "@/lib/exam/question-bank-logic"

interface ExamTakingProps {
  exam: Exam & { questions: ExamQuestion[] }
  userId: string
}

export function ExamTaking({ exam, userId }: ExamTakingProps) {
  const router = useRouter()
  const examQuestions = exam.questions
  const questions = examQuestions.map(eq => eq.question).filter(Boolean) as QuestionBank[]
  const questionScores: Record<string, number> = {}
  examQuestions.forEach(eq => {
    if (eq.question) {
      questionScores[eq.question.id] = eq.score
    }
  })
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ score: number; correctCount: number } | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // 处理答案选择
  const handleAnswer = (questionId: string, optionId: string, questionType: string) => {
    if (questionType === 'multiple_choice') {
      // 多选题 - 切换选择（存储为 JSON 字符串）
      setAnswers(prev => {
        const current = prev[questionId] || "[]"
        let currentArr: string[] = []
        try {
          currentArr = JSON.parse(current)
        } catch {
          currentArr = []
        }
        
        if (currentArr.includes(optionId)) {
          currentArr = currentArr.filter(id => id !== optionId)
        } else {
          currentArr = [...currentArr, optionId]
        }
        return { ...prev, [questionId]: JSON.stringify(currentArr) }
      })
    } else {
      // 单选题/其他 - 单选
      setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }
  }

  // 检查是否选中
  const isOptionSelected = (questionId: string, optionId: string, questionType: string): boolean => {
    const answer = answers[questionId]
    if (!answer) return false
    
    if (questionType === 'multiple_choice') {
      try {
        const arr = JSON.parse(answer)
        return arr.includes(optionId)
      } catch {
        return false
      }
    }
    return answer === optionId
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

  const handleSubmit = async () => {
    if (!attemptId || !exam.id) {
      console.error('Missing attemptId or exam.id!')
      setIsSubmitted(true)
      return
    }
    
    // 转换 answers 格式为 Record<string, string[]>
    // 只包含前端实际显示的题目（过滤掉 question 为 null 的）
    const answersArray: Record<string, string[]> = {}
    questions.forEach(q => {
      const answer = answers[q.id]
      if (answer) {
        try {
          // 尝试解析为数组（多选题）
          answersArray[q.id] = JSON.parse(answer)
        } catch {
          // 非多选题，直接作为单元素数组
          answersArray[q.id] = [answer]
        }
      } else {
        answersArray[q.id] = []
      }
    })
    
    console.log('Submitting answers:', answersArray)
    console.log('Questions:', questions.map(q => q.id))
    
    const result = await submitExam(exam.id, attemptId, answersArray)
    
    setSubmitResult({
      score: result.score,
      correctCount: result.correctCount
    })
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
    let rawScore = 0
    
    if (submitResult) {
      correctCount = submitResult.correctCount
      rawScore = submitResult.score
    } else {
      questions.forEach(q => {
        const userAnswer = answers[q.id]
        if (userAnswer) {
          // 转换答案格式
          let answerToCheck = userAnswer
          if (q.type === 'multiple_choice') {
            try {
              const arr = JSON.parse(userAnswer)
              answerToCheck = JSON.stringify(arr)
            } catch {
              answerToCheck = userAnswer
            }
          }
          if (checkAnswer(answerToCheck, q.answer, q.type as QuestionType)) {
            correctCount++
            rawScore += questionScores[q.id] || q.score
          }
        }
      })
    }
    
    const scorePercent = Math.round((correctCount / questions.length) * 100)
    
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/exams")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回列表
        </Button>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full mx-auto",
              scorePercent >= 60 ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"
            )}>
              <Award className="w-10 h-10" />
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">{scorePercent}</p>
              <p className="text-sm text-muted-foreground mt-1">总分 {exam.total_score} 分（实际得分 {rawScore}）</p>
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
            const userAnswer = answers[q.id]
            const questionType = q.type as QuestionType
            const options = parseQuestionOptions(q.options)
            
            // 转换答案格式
            let answerToCheck = userAnswer || ""
            if (questionType === 'multiple_choice' && userAnswer) {
              try {
                answerToCheck = JSON.stringify(JSON.parse(userAnswer))
              } catch {}
            }
            
            const isCorrect = checkAnswer(answerToCheck, q.answer, questionType)
            
            // 格式化用户答案显示
            const formatUserAnswer = (ans: string | undefined, type: string) => {
              if (!ans) return "未作答"
              if (type === 'multiple_choice') {
                return parseQuestionAnswer(ans, type, options)
              }
              if (type === 'single_choice' || type === 'true_false') {
                return parseQuestionAnswer(ans, type, options)
              }
              return parseQuestionAnswer(ans, type, null)
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
                        {formatUserAnswer(userAnswer, questionType)}
                      </span>
                    </p>
                    {!isCorrect && q.answer && (
                      <p className="text-[hsl(var(--success))]">
                        正确答案: {parseQuestionAnswer(q.answer, questionType, options)}
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
  const questionType = q.type as QuestionType
  const options = parseQuestionOptions(q.options)

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
            <ArrowLeft className="w-4 h-4" />退出考试
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
            <Badge variant="secondary" className="text-xs mb-3">{questionScores[q.id] || q.score}分 · {questionTypeLabels[questionType] || q.type}</Badge>
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">{q.title}</h2>
          </div>

          {/* 是非题 */}
          {questionType === 'true_false' && (
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(q.id, 'true', q.type)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isOptionSelected(q.id, 'true', q.type)
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                  isOptionSelected(q.id, 'true', q.type)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  ✓
                </span>
                <span className="text-sm">正确</span>
              </button>
              <button
                onClick={() => handleAnswer(q.id, 'false', q.type)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isOptionSelected(q.id, 'false', q.type)
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                  isOptionSelected(q.id, 'false', q.type)
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
          {(questionType === 'fill_blank' || questionType === 'essay') && (
            <div className="space-y-3">
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={questionType === 'fill_blank' ? '请输入答案' : '请输入您的回答'}
                className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          )}

          {/* 选择题（单选、多选）- 显示选项 */}
          {options && options.length > 0 && (
            <div className="space-y-3">
              {options.map((optText, oi) => {
                const optLetter = String.fromCharCode(65 + oi)
                const isMulti = questionType === 'multiple_choice'
                const isSelected = isOptionSelected(q.id, optLetter, q.type)
                
                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(q.id, optLetter, q.type)}
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
                        optLetter
                      )}
                    </span>
                    <span className="text-sm">{optText}</span>
                  </button>
                )
              })}
              {questionType === 'multiple_choice' && (
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
