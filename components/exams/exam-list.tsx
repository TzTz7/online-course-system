import Link from "next/link"
import { ChevronRight, Clock, FileText, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getExams, getExamAttempts } from "@/lib/data"
import type { UserRole } from "@/lib/definitions"

interface ExamListProps {
  userId: string
  userRole: UserRole
}

export async function ExamList({ userId, userRole }: ExamListProps) {
  const { exams } = await getExams({ limit: 50 })

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">暂无试卷</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {exams.map((exam) => (
        <ExamCard 
          key={exam.id} 
          exam={exam} 
          userId={userId} 
          userRole={userRole} 
        />)
      )}
    </div>
  )
}

interface ExamCardProps {
  exam: Awaited<ReturnType<typeof getExams>>["exams"][0]
  userId: string
  userRole: UserRole
}

async function ExamCard({ exam, userId, userRole }: ExamCardProps) {
  const isStudent = userRole === "student"
  const isTeacher = userRole === "teacher" || userRole === "admin"
  
  let attemptInfo: { score?: number; status?: string } | null = null
  
  if (isStudent) {
    const attempts = await getExamAttempts(exam.id, userId)
    if (attempts.length > 0) {
      const lastAttempt = attempts[0]
      attemptInfo = {
        score: lastAttempt.score as number | undefined,
        status: lastAttempt.status
      }
    }
  }

  const canTake = isStudent && (!attemptInfo || attemptInfo.status === "in-progress")
  const isCompleted = attemptInfo && (attemptInfo.status === "submitted" || attemptInfo.status === "graded")

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{exam.title}</h3>
          {isCompleted ? (
            <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 text-xs">已完成</Badge>
          ) : canTake ? (
            <Badge className="bg-primary/10 text-primary border-0 text-xs">可参加</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">{exam.status}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {exam.course_name && <span>{exam.course_name}</span>}
          <span>{exam.question_count}题</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{exam.duration}分钟
          </span>
          <span>{exam.total_score}分</span>
        </div>

        {isCompleted && attemptInfo?.score !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-sm font-semibold text-foreground">得分: {attemptInfo.score}</span>
            <Link 
              href={`/exams/${exam.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              查看详情 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {isTeacher && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> 查看成绩
            </span>
            <Link 
              href={`/exams/${exam.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              进入 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {isStudent && canTake && (
          <Link
            href={`/exams/${exam.id}`}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center block"
          >
            开始考试
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
