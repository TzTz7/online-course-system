import { Filter } from "lucide-react"
import { CourseCard } from "./course-card"
import { CoursePagination } from "./course-pagination"
import type { Course } from "@/lib/definitions"

interface CourseTableProps {
  courses: Course[]
  page: number
  totalPages: number
  total: number
}

export function CourseTable({ courses, page, totalPages, total }: CourseTableProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">没有找到匹配的课程</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        共 {total} 门课程
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <CoursePagination page={page} totalPages={totalPages} />
    </div>
  )
}
