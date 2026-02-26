import type { QuestionBank } from "@/lib/definitions"
import { QuestionCardInteractive } from "./question-card-interactive"

interface QuestionBankListProps {
  userRole: "student" | "teacher" | "admin"
  questions: QuestionBank[]
}

export function QuestionBankList({ userRole, questions }: QuestionBankListProps) {
  const isTeacher = userRole === "teacher" || userRole === "admin"

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无题库题目</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <QuestionCardInteractive key={q.id} question={q} isTeacher={isTeacher} />
      ))}
    </div>
  )
}
