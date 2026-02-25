import { Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CourseSearch } from "@/components/courses/course-search"
import { CourseCategories } from "@/components/courses/course-categories"
import { CourseTable } from "@/components/courses/course-table"
import { getCategories, getCourses } from "@/lib/data"

interface CoursesPageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const search = params.search || ""
  const categoryId = params.category || ""
  const page = parseInt(params.page || "1", 10)
  const limit = 6

  const [categoriesData, coursesData] = await Promise.all([
    getCategories(),
    getCourses({ search, categoryId, page, limit })
  ])

  const { courses, total, totalPages } = coursesData

  return (
    <DashboardLayout>
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">课程中心</h1>
          <p className="text-muted-foreground mt-1">探索丰富的课程资源，开启你的学习之旅</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <CourseSearch defaultValue={search} />
        </div>

        <Suspense fallback={<div className="h-10 animate-pulse bg-card rounded-xl" />}>
          <CourseCategories categories={categoriesData} />
        </Suspense>

        <CourseTable 
          courses={courses} 
          page={page} 
          totalPages={totalPages}
          total={total}
        />
      </div>
    </DashboardLayout>
  )
}
