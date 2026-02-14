"use client"

import { useState } from "react"
import { Search, FileText, Download, Eye, Calendar, BookOpen, File, FileImage } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const materials = [
  { id: 1, name: "高等数学第一章讲义", course: "高等数学", type: "PDF", size: "2.4MB", date: "2026-01-15", downloads: 156, icon: FileText },
  { id: 2, name: "数据结构课件PPT", course: "数据结构与算法", type: "PPT", size: "8.1MB", date: "2026-01-12", downloads: 203, icon: File },
  { id: 3, name: "计算机网络实验手册", course: "计算机网络", type: "PDF", size: "3.7MB", date: "2026-01-10", downloads: 134, icon: FileText },
  { id: 4, name: "AI导论知识图谱", course: "人工智能导论", type: "PNG", size: "1.2MB", date: "2026-01-08", downloads: 289, icon: FileImage },
  { id: 5, name: "微积分公式总结", course: "高等数学", type: "PDF", size: "0.8MB", date: "2026-01-05", downloads: 421, icon: FileText },
  { id: 6, name: "排序算法可视化笔记", course: "数据结构与算法", type: "PDF", size: "4.5MB", date: "2026-01-03", downloads: 178, icon: FileText },
  { id: 7, name: "操作系统进程调度", course: "操作系统原理", type: "PPT", size: "6.2MB", date: "2025-12-28", downloads: 98, icon: File },
  { id: 8, name: "深度学习框架对比", course: "深度学习", type: "PDF", size: "1.9MB", date: "2025-12-25", downloads: 312, icon: FileText },
]

export function MaterialsContent() {
  const [search, setSearch] = useState("")

  const filtered = materials.filter((m) =>
    m.name.includes(search) || m.course.includes(search)
  )

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">课程讲义</h1>
        <p className="text-muted-foreground mt-1">下载课程资料，随时随地离线学习</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索讲义资料..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((material) => (
          <Card key={material.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                  <material.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{material.name}</h3>
                    <Badge variant="secondary" className="text-xs">{material.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{material.course}</span>
                    <span>{material.size}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{material.date}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" />{material.downloads}次下载</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Eye className="w-3.5 h-3.5" /> 预览
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                    <Download className="w-3.5 h-3.5" /> 下载
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
