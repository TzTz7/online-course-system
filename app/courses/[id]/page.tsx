import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CourseDetail } from "@/components/courses/course-detail"

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardLayout>
      <CourseDetail courseId={id} />
    </DashboardLayout>
  )
}
