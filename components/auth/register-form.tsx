'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight, UserCircle, GraduationCapIcon } from 'lucide-react';
import { registerUser } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    undefined,
  );

  return (
    <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-accent-foreground mx-auto mb-4 shadow-lg shadow-accent/25">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">创建账号</h1>
            <p className="text-sm text-muted-foreground">加入 SmartEdu 开启学习之旅</p>
          </div>

          <form action={formAction} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="请输入用户名"
                  required
                  minLength={2}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              {state?.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="至少 6 位密码"
                  required
                  minLength={6}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  required
                  minLength={6}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              {state?.errors?.confirmPassword && (
                <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
              )}
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                我是
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input type="radio" name="role" value="student" className="peer sr-only" required />
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-input bg-background text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all duration-200">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">学生</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input type="radio" name="role" value="teacher" className="peer sr-only" />
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-input bg-background text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all duration-200">
                    <GraduationCapIcon className="w-5 h-5" />
                    <span className="font-medium">教师</span>
                  </div>
                </label>
              </div>
              {state?.errors?.role && (
                <p className="text-sm text-destructive">{state.errors.role[0]}</p>
              )}
            </div>

            {/* Error message */}
            {state?.message && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  注册中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  注册
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
