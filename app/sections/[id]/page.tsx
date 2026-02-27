import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SectionViewer } from "@/components/sections/section-viewer"
import { getSectionById } from "@/lib/course-actions/section"
import { notFound } from "next/navigation"

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const section = await getSectionById(id)

  if (!section) {
    notFound()
  }

  return (
    <DashboardLayout>
      <SectionViewer section={section} />
    </DashboardLayout>
  )
}
