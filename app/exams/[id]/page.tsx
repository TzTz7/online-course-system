import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExamTaking } from "@/components/exams/exam-taking"
import { ExamDetail } from "@/components/exams/exam-detail"
import { getExamById } from "@/lib/data"
import { auth } from "@/auth"

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id || ""
  const userRole = session?.user?.role || "student"
  
  const exam = await getExamById(id)
  
  const isTeacher = userRole === "teacher" || userRole === "admin"
  
  if (!exam) {
    return (
      <DashboardLayout>
        <ExamDetail examId={id} userRole={userRole} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {isTeacher ? (
        <ExamDetail examId={id} userRole={userRole} />
      ) : (
        <ExamTaking exam={exam} userId={userId} />
      )}
    </DashboardLayout>
  )
}
