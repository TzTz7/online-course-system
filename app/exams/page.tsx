import { auth } from "@/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExamsClient } from "@/components/exams/exams-client"
import { fetchExams, fetchQuestions } from "@/lib/exam-actions"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ExamsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === "bank" ? "bank" : "papers"
  
  const session = await auth()
  const userRole = (session?.user?.role as "student" | "teacher" | "admin") || "student"
  const userId = session?.user?.id || ""

  // 在 Server Component 中获取数据
  const [exams, questions] = await Promise.all([
    fetchExams({ limit: 50 }),
    fetchQuestions({ limit: 50 })
  ])

  return (
    <DashboardLayout>
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <ExamsClient 
          initialTab={tab} 
          userRole={userRole} 
          userId={userId}
          exams={exams}
          questions={questions}
        />
      </div>
    </DashboardLayout>
  )
}
