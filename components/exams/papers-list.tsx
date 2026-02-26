import Link from "next/link"
import type { Exam } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PapersListProps {
  userRole: "student" | "teacher" | "admin"
  exams: Exam[]
}

export function PapersList({ userRole, exams }: PapersListProps) {
  const isTeacher = userRole === "teacher" || userRole === "admin"

  if (exams.length === 0) {
    return (
      <div className="col-span-2 text-center py-12">
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
          userRole={userRole}
        />
      ))}
    </div>
  )
}

function ExamCard({ exam, userRole }: { exam: Exam; userRole: string }) {
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
