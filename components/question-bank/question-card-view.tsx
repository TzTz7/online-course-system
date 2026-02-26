import type { QuestionCard, QuestionType } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  parseQuestionAnswer, 
  questionTypeLabels 
} from "@/lib/exam/question-bank-logic"

interface QuestionCardViewProps {
  question: QuestionCard
  isTeacher: boolean
  submittedAnswer?: string
  isCorrect?: boolean
  showResult?: boolean
  children?: React.ReactNode
}

export function QuestionCardView({ 
  question, 
  isTeacher, 
  submittedAnswer, 
  isCorrect,
  showResult,
  children
}: QuestionCardViewProps) {
  const correctAnswer = question.answer
  const questionType = question.type as QuestionType
  const answerText = parseQuestionAnswer(correctAnswer, questionType, null)

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {/* 题目标题 */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="text-xs">
                {questionTypeLabels[questionType] || question.type}
              </Badge>
              {question.course_name && (
                <Badge variant="secondary" className="text-xs">{question.course_name}</Badge>
              )}
              <Badge variant="secondary" className="text-xs">{question.score}分</Badge>
            </div>
            <p className="text-sm text-foreground">{question.title}</p>

            {/* 教师视角：显示正确答案 */}
            {isTeacher && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">正确答案: </span>
                  <span className="text-muted-foreground">{answerText}</span>
                </div>
              </div>
            )}

            {/* 学生视角：显示答题结果 */}
            {showResult && !isTeacher && (
              <div className={`mt-3 pt-3 border-t ${isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
                <div className="flex items-center gap-2 text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-medium">回答正确</span>
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">回答错误</span>
                  )}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">你的答案: </span>
                  <span className={isCorrect ? "text-green-500" : "text-red-500"}>
                    {submittedAnswer || "未作答"}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">正确答案: </span>
                    <span className="text-green-500">{answerText}</span>
                  </div>
                )}
              </div>
            )}

            {/* 答题表单 - 由 QuestionAnswerForm 渲染 */}
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
