"use client"

import Link from "next/link"
import {
  BookOpen,
  Brain,
  Video,
  ClipboardList,
  FileText,
  Bot,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Award,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const stats = [
  { label: "在学课程", value: "6", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { label: "学习时长", value: "128h", icon: Clock, color: "bg-accent/10 text-accent" },
  { label: "完成测试", value: "24", icon: Award, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  { label: "班级排名", value: "Top 5", icon: TrendingUp, color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
]

const quickActions = [
  { href: "/courses", label: "课程中心", desc: "浏览全部课程资源", icon: BookOpen, color: "bg-primary" },
  { href: "/ai-tutor", label: "AI智能辅导", desc: "AI一对一答疑解惑", icon: Brain, color: "bg-accent" },
  { href: "/classroom", label: "在线课堂", desc: "实时互动教学", icon: Video, color: "bg-[hsl(var(--success))]" },
  { href: "/exams", label: "考试题库", desc: "在线测评与练习", icon: ClipboardList, color: "bg-[hsl(var(--warning))]" },
  { href: "/materials", label: "课程讲义", desc: "讲义资料下载", icon: FileText, color: "bg-primary" },
  { href: "/ai-roles", label: "AI角色", desc: "智能机器人互动", icon: Bot, color: "bg-accent" },
]

const recentCourses = [
  { name: "高等数学", progress: 72, chapter: "第七章 微分方程", teacher: "张教授" },
  { name: "数据结构与算法", progress: 45, chapter: "第四章 树与二叉树", teacher: "李教授" },
  { name: "计算机网络", progress: 88, chapter: "第六章 应用层协议", teacher: "王教授" },
  { name: "人工智能导论", progress: 30, chapter: "第三章 搜索算法", teacher: "陈教授" },
]

const announcements = [
  { title: "高等数学期中考试安排", time: "2小时前", type: "考试" },
  { title: "数据结构课程作业已发布", time: "5小时前", type: "作业" },
  { title: "AI导论课程新增实验环节", time: "1天前", type: "通知" },
  { title: "计算机网络课程直播预告", time: "2天前", type: "直播" },
]

export function DashboardContent() {
  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">欢迎回来，同学</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">今天是学习的好日子，继续加油吧</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${action.color} text-primary-foreground group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden md:block group-hover:text-foreground/70 transition-colors">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">学习进度</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              全部课程 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentCourses.map((course) => (
              <Card key={course.name} className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{course.name}</h3>
                    <span className="text-xs text-primary font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{course.chapter}</span>
                    <span>{course.teacher}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">最新通知</h2>
          <Card className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-0">
              {announcements.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/50 hover:px-5 transition-all duration-200 cursor-pointer"
                >
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium shrink-0 mt-0.5 ${
                    item.type === "考试" ? "bg-destructive/10 text-destructive" :
                    item.type === "作业" ? "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" :
                    item.type === "直播" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {item.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Online users */}
      <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-success/20 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">当前在线</p>
                <p className="text-xs text-muted-foreground">实时在线学习人数</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">1,234</p>
                <p className="text-xs text-[hsl(var(--success))]">+12% 较昨日</p>
              </div>
              <Link href="/chatroom" className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:scale-105 transition-all duration-200 cursor-pointer">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">进入聊天室</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
