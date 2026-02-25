"use client"

import { useState } from "react"
import { ClipboardList, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExamTabsProps {
  activeTab: "papers" | "bank"
  onTabChange: (tab: "papers" | "bank") => void
}

export function ExamTabs({ activeTab, onTabChange }: ExamTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTabChange("papers")}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          activeTab === "papers" 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> 试卷列表
        </span>
      </button>
      <button
        onClick={() => onTabChange("bank")}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          activeTab === "bank" 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> 题库练习
        </span>
      </button>
    </div>
  )
}
