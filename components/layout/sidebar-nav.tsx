"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/lib/actions"
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  Bot,
  FileText,
  Video,
  ClipboardList,
  Home,
  ChevronLeft,
  ChevronRight,
  Brain,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/courses", label: "课程中心", icon: BookOpen },
  { href: "/ai-tutor", label: "AI智能辅导", icon: Brain },
  { href: "/classroom", label: "在线课堂", icon: Video },
  { href: "/exams", label: "考试题库", icon: ClipboardList },
  { href: "/materials", label: "课程讲义", icon: FileText },
  { href: "/ai-roles", label: "AI角色", icon: Bot },
  { href: "/chatroom", label: "聊天室", icon: MessageSquare },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-card text-foreground shadow-md md:hidden"
        aria-label="打开菜单"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-card to-card/80 border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">SmartEdu</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="关闭菜单"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border space-y-2">
          <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center")}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <Users className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">学生用户</p>
                <p className="text-xs text-muted-foreground truncate">student@smartedu.com</p>
              </div>
            )}
          </div>
          
          {/* Logout button */}
          <form action={signOutAction}>
            <button
              type="submit"
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>退出登录</span>}
            </button>
          </form>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  )
}
