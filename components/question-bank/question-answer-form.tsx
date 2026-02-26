"use client"

import { useState, useEffect } from "react"
import type { QuestionCard, QuestionType } from "@/lib/definitions"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { parseQuestionOptions } from "@/lib/exam/question-bank-logic"

interface QuestionAnswerFormProps {
  question: QuestionCard
  onSubmit?: (answer: string) => void
  submittedAnswer?: string
  showResult?: boolean
}

export function QuestionAnswerForm({ 
  question, 
  onSubmit,
  submittedAnswer,
  showResult
}: QuestionAnswerFormProps) {
  const questionType = question.type as QuestionType
  const options = parseQuestionOptions(question.options)
  const hasOptions = options && options.length > 0

  // 单选题/是非题：单选
  const [singleAnswer, setSingleAnswer] = useState("")

  // 多选题：多选
  const [multiAnswer, setMultiAnswer] = useState<string[]>([])

  // 填空/简答
  const [textAnswer, setTextAnswer] = useState("")

  // 当 submittedAnswer 变化时更新内部状态
  useEffect(() => {
    if (showResult) {
      // 重置状态
      setSingleAnswer("")
      setMultiAnswer([])
      setTextAnswer("")
    } else if (submittedAnswer) {
      // 初始化已有答案
      if (questionType === 'multiple_choice') {
        try {
          setMultiAnswer(JSON.parse(submittedAnswer))
        } catch {
          setMultiAnswer([])
        }
      } else {
        setSingleAnswer(submittedAnswer)
        setTextAnswer(submittedAnswer)
      }
    }
  }, [submittedAnswer, showResult, questionType])

  const handleSingleSelect = (optLetter: string) => {
    setSingleAnswer(optLetter)
  }

  const handleMultiToggle = (optLetter: string) => {
    if (multiAnswer.includes(optLetter)) {
      setMultiAnswer(multiAnswer.filter(a => a !== optLetter))
    } else {
      setMultiAnswer([...multiAnswer, optLetter])
    }
  }

  const handleSubmit = () => {
    let answer = ""
    
    switch (questionType) {
      case 'single_choice':
        answer = singleAnswer
        break
      case 'multiple_choice':
        answer = JSON.stringify(multiAnswer)
        break
      case 'true_false':
        answer = singleAnswer
        break
      case 'fill_blank':
      case 'essay':
        answer = textAnswer
        break
    }

    if (!answer || (Array.isArray(answer) && answer.length === 0)) return
    if (typeof answer === 'string' && !answer.trim()) return

    onSubmit?.(answer)
  }

  const canSubmit = () => {
    switch (questionType) {
      case 'single_choice':
      case 'true_false':
        return !!singleAnswer
      case 'multiple_choice':
        return multiAnswer.length > 0
      case 'fill_blank':
      case 'essay':
        return !!textAnswer.trim()
      default:
        return false
    }
  }

  if (showResult) {
    return null // 结果由 QuestionCardView 展示
  }

  return (
    <div className="mt-3">
      {/* 是非题 */}
      {questionType === 'true_false' && (
        <div className="space-y-2 mb-3">
          <button
            type="button"
            onClick={() => handleSingleSelect("true")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
              singleAnswer === "true"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
              singleAnswer === "true"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}>✓</span>
            <span className="text-sm">正确</span>
          </button>
          <button
            type="button"
            onClick={() => handleSingleSelect("false")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
              singleAnswer === "false"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
              singleAnswer === "false"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}>✗</span>
            <span className="text-sm">错误</span>
          </button>
        </div>
      )}

      {/* 填空题、简答题、论述题 */}
      {(questionType === 'fill_blank' || questionType === 'essay') && (
        <Textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="请输入答案"
          className="mb-3"
        />
      )}

      {/* 单选题 */}
      {hasOptions && questionType === 'single_choice' && (
        <div className="space-y-2 mb-3">
          {options.map((optText, oi) => {
            const optLetter = String.fromCharCode(65 + oi)
            return (
              <button
                type="button"
                key={oi}
                onClick={() => handleSingleSelect(optLetter)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  singleAnswer === optLetter
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
                  singleAnswer === optLetter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {optLetter}
                </span>
                <span className="text-sm">{optText}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 多选题 */}
      {hasOptions && questionType === 'multiple_choice' && (
        <div className="space-y-2 mb-3">
          {options.map((optText, oi) => {
            const optLetter = String.fromCharCode(65 + oi)
            const isSelected = multiAnswer.includes(optLetter)
            return (
              <button
                type="button"
                key={oi}
                onClick={() => handleMultiToggle(optLetter)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {isSelected && "✓"}
                </span>
                <span className="text-sm">{optText}</span>
              </button>
            )
          })}
          {multiAnswer.length > 0 && (
            <p className="text-xs text-muted-foreground">
              已选择: {multiAnswer.join(", ")}
            </p>
          )}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit()}>
        提交答案
      </Button>
    </div>
  )
}
