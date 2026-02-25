import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/definitions"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
        <CardContent className="p-0">
          <div className="h-24 bg-primary/5 rounded-t-xl flex items-center justify-center relative overflow-hidden">
            {course.cover_image ? (
              <img 
                src={course.cover_image} 
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-10 h-10 text-primary/30" />
            )}
            {course.category_name && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs bg-card/80 backdrop-blur-sm text-foreground">
                  {course.category_name}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {course.description || '暂无描述'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {course.teacher_name || '未知教师'}
              </span>
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                查看详情
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
