"use client"

import { useState } from "react"
import { Search, Filter, BookOpen, Clock, Users, Star, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

const categories = ["全部", "计算机科学", "数学", "人工智能", "网络工程", "软件工程"]

const courses = [
  {
    id: 1,
    name: "高等数学",
    category: "数学",
    teacher: "张教授",
    students: 320,
    rating: 4.8,
    hours: 64,
    chapters: 12,
    progress: 72,
    description: "涵盖微积分、微分方程、级数等核心内容",
    tags: ["必修", "基础"],
  },
  {
    id: 2,
    name: "数据结构与算法",
    category: "计算机科学",
    teacher: "李教授",
    students: 280,
    rating: 4.9,
    hours: 56,
    chapters: 10,
    progress: 45,
    description: "学习线性表、树、图等数据结构及排序搜索算法",
    tags: ["必修", "核心"],
  },
  {
    id: 3,
    name: "计算机网络",
    category: "网络工程",
    teacher: "王教授",
    students: 256,
    rating: 4.7,
    hours: 48,
    chapters: 8,
    progress: 88,
    description: "深入理解TCP/IP协议栈、网络架构与应用",
    tags: ["必修", "核心"],
  },
  {
    id: 4,
    name: "人工智能导论",
    category: "人工智能",
    teacher: "陈教授",
    students: 412,
    rating: 4.9,
    hours: 52,
    chapters: 11,
    progress: 30,
    description: "探索AI基础理论、机器学习与深度学习入门",
    tags: ["选修", "热门"],
  },
  {
    id: 5,
    name: "操作系统原理",
    category: "计算机科学",
    teacher: "刘教授",
    students: 198,
    rating: 4.6,
    hours: 48,
    chapters: 9,
    progress: 0,
    description: "进程管理、内存管理、文件系统与I/O系统",
    tags: ["必修", "核心"],
  },
  {
    id: 6,
    name: "软件工程",
    category: "软件工程",
    teacher: "赵教授",
    students: 234,
    rating: 4.5,
    hours: 40,
    chapters: 8,
    progress: 15,
    description: "软件开发方法论、需求分析与项目管理",
    tags: ["必修", "实践"],
  },
  {
    id: 7,
    name: "深度学习",
    category: "人工智能",
    teacher: "孙教授",
    students: 356,
    rating: 4.8,
    hours: 60,
    chapters: 14,
    progress: 0,
    description: "神经网络、CNN、RNN、Transformer等深度学习模型",
    tags: ["选修", "进阶"],
  },
  {
    id: 8,
    name: "离散数学",
    category: "数学",
    teacher: "周教授",
    students: 275,
    rating: 4.4,
    hours: 44,
    chapters: 10,
    progress: 60,
    description: "集合论、图论、数理逻辑与组合数学",
    tags: ["必修", "基础"],
  },
]

export function CourseCatalog() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("全部")

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.includes(search) || c.description.includes(search) || c.teacher.includes(search)
    const matchCategory = activeCategory === "全部" || c.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">课程中心</h1>
        <p className="text-muted-foreground mt-1">探索丰富的课程资源，开启你的学习之旅</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索课程、教师..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
              <CardContent className="p-0">
                {/* Course header color band */}
                <div className="h-24 bg-primary/5 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="w-10 h-10 text-primary/30" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-card/80 backdrop-blur-sm text-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={course.progress} className="h-1 rounded-none" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{course.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.hours}课时</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}人</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[hsl(var(--warning))]" />{course.rating}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{course.teacher}</span>
                    {course.progress > 0 ? (
                      <span className="text-xs text-primary font-medium">继续学习 {course.progress}%</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Play className="w-3 h-3" />开始学习
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">没有找到匹配的课程</p>
        </div>
      )}
    </div>
  )
}
