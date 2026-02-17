'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { signOutAction } from '@/lib/actions'
import { SidebarWrapper } from './sidebar-wrapper'
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  Bot,
  FileText,
  Video,
  ClipboardList,
  Home,
  Users,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/courses', label: '课程中心', icon: BookOpen },
  { href: '/ai-tutor', label: 'AI智能辅导', icon: Bot },
  { href: '/classroom', label: '在线课堂', icon: Video },
  { href: '/exams', label: '考试题库', icon: ClipboardList },
  { href: '/materials', label: '课程讲义', icon: FileText },
  { href: '/ai-roles', label: 'AI角色', icon: Bot },
  { href: '/chatroom', label: '聊天室', icon: MessageSquare },
]

export function SidebarNav() {
  const { data: session } = useSession()
  const user = session?.user
  return (
    <SidebarWrapper>
      {({ collapsed, mobileOpen, pathname, setMobileOpen }) => (
        <>
          {/* Logo */}
          <div className="hidden md:flex items-center justify-between h-16 px-4 border-b border-border">
            {!collapsed ? (
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  SmartEdu
                </span>
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center h-16 px-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                SmartEdu
              </span>
            </Link>
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
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-sm'
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
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2',
                collapsed && 'justify-center'
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                <Users className="w-4 h-4" />
              </div>

              {!collapsed && user && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name || '用户'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}

              {!collapsed && !user && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    游客
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    未登录
                  </p>
                </div>
              )}
            </div>

            {/* Logout button */}
            {user && (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>退出登录</span>}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </SidebarWrapper>
  )
}
