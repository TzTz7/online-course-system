"use client"

import { useState } from "react"
import type { QuestionCard, QuestionType } from "@/lib/definitions"
import { QuestionCardView } from "./question-card-view"
import { QuestionAnswerForm } from "./question-answer-form"
import { checkAnswer } from "@/lib/exam/question-bank-logic"
import { Button } from "@/components/ui/button"

interface QuestionCardInteractiveProps {
  question: QuestionCard
  isTeacher: boolean
}

export function QuestionCardInteractive({ question, isTeacher }: QuestionCardInteractiveProps) {
  const [submittedAnswer, setSubmittedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)

  const questionType = question.type as QuestionType
  const correctAnswer = question.answer

  const handleSubmit = (answer: string) => {
    setSubmittedAnswer(answer)
    setShowResult(true)
  }

  const handleReset = () => {
    setSubmittedAnswer("")
    setShowResult(false)
  }

  const isCorrect = checkAnswer(submittedAnswer, correctAnswer, questionType)

  return (
    <QuestionCardView 
      question={question}
      isTeacher={isTeacher}
      submittedAnswer={submittedAnswer}
      isCorrect={isCorrect}
      showResult={showResult}
    >
      {!isTeacher && !showResult && (
        <QuestionAnswerForm 
          question={question} 
          onSubmit={handleSubmit}
          submittedAnswer={submittedAnswer}
          showResult={showResult}
        />
      )}

      {!isTeacher && showResult && (
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
          >
            重新作答
          </Button>
        </div>
      )}
    </QuestionCardView>
  )
}
