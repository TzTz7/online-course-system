import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CourseDetail } from "@/components/courses/course-detail"
import { getCourseChapters } from "@/lib/course-actions/chapters"
import { notFound } from "next/navigation"

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const courseData = await getCourseChapters(id)

  if (!courseData) {
    notFound()
  }

  return (
    <DashboardLayout>
      <CourseDetail data={courseData} />
    </DashboardLayout>
  )
}
