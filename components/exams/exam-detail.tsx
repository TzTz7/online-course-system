import Link from "next/link"
import { ArrowLeft, Clock, Users, FileText, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getExamById, getExamAttempts } from "@/lib/data"
import type { UserRole } from "@/lib/definitions"

interface ExamDetailProps {
  examId: string
  userRole: UserRole
}

export async function ExamDetail({ examId, userRole }: ExamDetailProps) {
  const exam = await getExamById(examId)
  
  if (!exam) {
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6">
        <Link href="/exams" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">试卷不存在</p>
        </div>
      </div>
    )
  }

  const isTeacher = userRole === "teacher" || userRole === "admin"
  const attempts = await getExamAttempts(examId)

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <Link href="/exams" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </Link>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">{exam.title}</h1>
            <Badge variant="secondary">{exam.status}</Badge>
          </div>
          
          {exam.description && (
            <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {exam.course_name && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />{exam.course_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{exam.duration}分钟
            </span>
            <span>{exam.question_count}题</span>
            <span>{exam.total_score}分</span>
          </div>
        </CardContent>
      </Card>

      {isTeacher && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">考试记录</h2>
            <span className="text-sm text-muted-foreground">{attempts.length}人参加</span>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">暂无学生参加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const score = attempt.score as number | null
                const isPassed = score !== null && score >= (exam.total_score * 0.6)
                
                return (
                  <Card key={attempt.id} className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {(attempt as any).user_name || "学生"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              提交时间: {attempt.submit_time ? new Date(attempt.submit_time).toLocaleString() : "未提交"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {score !== null ? (
                            <>
                              <p className={`text-lg font-bold ${isPassed ? "text-green-500" : "text-destructive"}`}>
                                {score}
                              </p>
                              <p className="text-xs text-muted-foreground">/{exam.total_score}分</p>
                            </>
                          ) : (
                            <Badge variant="outline">未提交</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {!isTeacher && exam.questions.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground">题目预览</h2>
          <div className="space-y-3">
            {exam.questions.slice(0, 5).map((eq, i) => (
              <Card key={eq.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs shrink-0">{eq.score}分</Badge>
                    <p className="text-sm text-foreground">{i + 1}. {eq.question?.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {exam.questions.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                还有 {exam.questions.length - 5} 道题...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
