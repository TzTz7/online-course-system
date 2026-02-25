import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQuestions } from "@/lib/data"
import type { QuestionBank, UserRole } from "@/lib/definitions"

const parseOptions = (opts: any) => {
  if (!opts) return null
  if (Array.isArray(opts)) return opts
  if (typeof opts === 'string') {
    try {
      return JSON.parse(opts)
    } catch {
      return null
    }
  }
  return opts
}

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  fill_blank: "填空题",
  short_answer: "简答题",
  essay: "论述题"
}

interface QuestionBankListProps {
  userRole: UserRole
}

export async function QuestionBankList({ userRole }: QuestionBankListProps) {
  const { questions } = await getQuestions({ limit: 50 })

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">暂无题库题目</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} userRole={userRole} />
      ))}
    </div>
  )
}

interface QuestionCardProps {
  question: QuestionBank
  userRole: UserRole
}

function QuestionCard({ question, userRole }: QuestionCardProps) {
  const isTeacher = userRole === "teacher" || userRole === "admin"
  const options = parseOptions(question.options) as { id: string; text: string }[] | null
  const answer = question.answer as { id: string }[] | string | null

  const getAnswerText = () => {
    if (!answer) return "暂无答案"
    if (typeof answer === "string") return answer
    if (Array.isArray(answer)) {
      return answer.map(a => {
        if (options) {
          const answerId = typeof a === 'object' ? a.id : a
          const opt = options.find(o => String(o.id) === String(answerId))
          return opt ? opt.text : String(answerId)
        }
        return typeof a === 'object' ? a.id : a
      }).join(", ")
    }
    return String(answer)
  }

  const hasOptions = options && options.length > 0

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
                {options.map((opt, oi) => {
                  let isCorrect = false
                  if (answer) {
                    if (typeof answer === "object" && "id" in answer[0]) {
                      isCorrect = answer.some((a: { id: string }) => a.id === opt.id)
                    }
                  }
                  return (
                    <span 
                      key={opt.id || oi} 
                      className={`text-xs text-muted-foreground px-3 py-1.5 bg-secondary rounded-lg ${
                        isTeacher && isCorrect ? "bg-green-500/10 text-green-500" : ""
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}. {opt.text}
                    </span>
                  )
                })}
              </div>
            )}

            {isTeacher && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">正确答案: </span>
                  <span className="text-muted-foreground">{getAnswerText()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
