"use client"

import { useState } from "react"
import Link from "next/link"
import { PapersList } from "@/components/exams/papers-list"
import { QuestionBankList } from "@/components/question-bank/question-bank-list"
import { ExamTabs } from "@/components/exams/exam-tabs"
import type { Exam, QuestionBank } from "@/lib/definitions"

interface ExamsClientProps {
  initialTab: "papers" | "bank"
  userRole: "student" | "teacher" | "admin"
  userId: string
  exams: Exam[]
  questions: QuestionBank[]
}

export function ExamsClient({ initialTab, userRole, userId, exams, questions }: ExamsClientProps) {
  const [tab, setTab] = useState(initialTab)
  const isTeacher = userRole === "teacher" || userRole === "admin"

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">考试题库</h1>
          <p className="text-muted-foreground mt-1">在线测评与练习，检验学习成果</p>
        </div>
        {isTeacher && (
          <Link
            href="/exams/create"
            className="shrink-0 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            创建试卷
          </Link>
        )}
      </div>

      <ExamTabs activeTab={tab} onTabChange={setTab} />
      {tab === "papers" ? (
        <PapersList userRole={userRole} exams={exams} />
      ) : (
        <QuestionBankList userRole={userRole} questions={questions} />
      )}
    </>
  )
}
