"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ExamTabs } from "./exam-tabs"
import { Skeleton } from "@/components/ui/skeleton"

const ExamList = dynamic(() => import("@/components/exams/exam-list").then(mod => mod.ExamList), {
  loading: () => <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>,
  ssr: false
})

const QuestionBankList = dynamic(() => import("@/components/exams/question-bank-list").then(mod => mod.QuestionBankList), {
  loading: () => <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>,
  ssr: false
})

interface ExamsContentClientProps {
  initialTab: "papers" | "bank"
  userRole: "student" | "teacher" | "admin"
  userId: string
}

export function ExamsContentClient({ initialTab, userRole, userId }: ExamsContentClientProps) {
  const [tab, setTab] = useState<"papers" | "bank">(initialTab)

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">考试题库</h1>
        <p className="text-muted-foreground mt-1">在线测评与练习，检验学习成果</p>
      </div>

      <ExamTabs activeTab={tab} onTabChange={setTab} />

      {tab === "papers" ? (
        <ExamList userId={userId} userRole={userRole} />
      ) : (
        <QuestionBankList userRole={userRole} />
      )}
    </div>
  )
}
