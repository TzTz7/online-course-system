import { auth } from "@/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExamsClient } from "@/components/exams/exams-client"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ExamsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === "bank" ? "bank" : "papers"
  
  const session = await auth()
  const userRole = (session?.user?.role as "student" | "teacher" | "admin") || "student"
  const userId = session?.user?.id || ""

  return (
    <DashboardLayout>
      <ExamsClient initialTab={tab} userRole={userRole} userId={userId} />
    </DashboardLayout>
  )
}
