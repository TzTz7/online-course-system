import { auth } from "@/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateExamClient } from "./create-exam-client"

export default async function CreateExamPage() {
  const session = await auth()
  const userId = session?.user?.id || ""
  const userRole = session?.user?.role || "student"
  
  const isTeacher = userRole === "teacher" || userRole === "admin"
  
  if (!isTeacher) {
    return (
      <DashboardLayout>
        <div className="p-4 pt-16 md:pt-6 md:p-6 text-center">
          <p className="text-muted-foreground">只有教师可以创建试卷</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <CreateExamClient userId={userId} />
    </DashboardLayout>
  )
}
