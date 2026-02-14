"use client"

import { useState } from "react"
import { ClipboardList, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft, BookOpen, Award, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const examPapers = [
  { id: 1, name: "高等数学期中测试", course: "高等数学", questions: 20, time: 90, difficulty: "中等", status: "available" as const },
  { id: 2, name: "数据结构单元测验", course: "数据结构与算法", questions: 15, time: 60, difficulty: "困难", status: "available" as const },
  { id: 3, name: "计算机网络模拟考", course: "计算机网络", questions: 25, time: 120, difficulty: "中等", status: "completed" as const, score: 86 },
  { id: 4, name: "AI导论随堂测试", course: "人工智能导论", questions: 10, time: 30, difficulty: "简单", status: "completed" as const, score: 92 },
]

const questionBank = [
  { id: 1, question: "求极限 lim(x->0) sin(x)/x 的值", type: "填空题", course: "高等数学", difficulty: "简单" },
  { id: 2, question: "以下哪种排序算法的平均时间复杂度为O(nlogn)？", type: "选择题", course: "数据结构与算法", difficulty: "简单", options: ["冒泡排序", "快速排序", "选择排序", "插入排序"], answer: 1 },
  { id: 3, question: "TCP和UDP的主要区别是什么？", type: "简答题", course: "计算机网络", difficulty: "中等" },
  { id: 4, question: "求不定积分 ∫x^2 cos(x) dx", type: "解答题", course: "高等数学", difficulty: "困难" },
  { id: 5, question: "在二叉搜索树中查找元素的最坏时间复杂度是？", type: "选择题", course: "数据结构与算法", difficulty: "中等", options: ["O(1)", "O(logn)", "O(n)", "O(n^2)"], answer: 2 },
]

type ExamView = "list" | "taking" | "result"

export function ExamsContent() {
  const [view, setView] = useState<ExamView>("list")
  const [tab, setTab] = useState<"papers" | "bank">("papers")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | string>>({})
  const [showResult, setShowResult] = useState(false)

  // Mock exam questions for taking
  const examQuestions = [
    { id: 0, question: "函数f(x) = x^2在x=1处的导数值为：", options: ["0", "1", "2", "3"], answer: 2 },
    { id: 1, question: "以下哪个是不定积分 ∫2x dx 的结果？", options: ["x^2", "x^2 + C", "2x^2", "2x^2 + C"], answer: 1 },
    { id: 2, question: "极限 lim(n->inf) (1+1/n)^n 等于：", options: ["0", "1", "e", "inf"], answer: 2 },
    { id: 3, question: "函数f(x)=|x|在x=0处是否可导？", options: ["可导，导数为0", "可导，导数为1", "不可导", "不确定"], answer: 2 },
    { id: 4, question: "级数 1+1/2+1/3+...+1/n 是否收敛？", options: ["收敛", "发散", "条件收敛", "绝对收敛"], answer: 1 },
  ]

  if (view === "taking") {
    const q = examQuestions[currentQuestion]
    return (
      <div className="flex flex-col h-screen">
        <div className="p-4 pt-16 md:pt-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> 退出考试
            </button>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-medium text-foreground">01:23:45</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>第 {currentQuestion + 1} / {examQuestions.length} 题</span>
              <span>{Math.round(((currentQuestion + 1) / examQuestions.length) * 100)}%</span>
            </div>
            <Progress value={((currentQuestion + 1) / examQuestions.length) * 100} className="h-1.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <Badge variant="secondary" className="text-xs mb-3">选择题</Badge>
              <h2 className="text-lg font-semibold text-foreground leading-relaxed">{q.question}</h2>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers({ ...answers, [currentQuestion]: oi })}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    answers[currentQuestion] === oi
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                    answers[currentQuestion] === oi
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              上一题
            </button>
            {currentQuestion < examQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                下一题
              </button>
            ) : (
              <button
                onClick={() => { setShowResult(true); setView("result") }}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-sm font-medium hover:opacity-90 transition-colors"
              >
                提交试卷
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (view === "result") {
    const correct = examQuestions.filter((q, i) => answers[i] === q.answer).length
    const score = Math.round((correct / examQuestions.length) * 100)
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <button onClick={() => { setView("list"); setCurrentQuestion(0); setAnswers({}) }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full mx-auto",
              score >= 60 ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"
            )}>
              <Award className="w-10 h-10" />
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">{score}</p>
              <p className="text-sm text-muted-foreground mt-1">总分 100 分</p>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-[hsl(var(--success))]"><CheckCircle className="w-4 h-4" /> 正确 {correct} 题</span>
              <span className="flex items-center gap-1 text-destructive"><XCircle className="w-4 h-4" /> 错误 {examQuestions.length - correct} 题</span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold text-foreground">答题详情</h2>
        <div className="space-y-3">
          {examQuestions.map((q, i) => {
            const isCorrect = answers[i] === q.answer
            return (
              <Card key={i} className={cn("border-border/50 shadow-sm", isCorrect ? "border-l-4 border-l-[hsl(var(--success))]" : "border-l-4 border-l-destructive")}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                    <p className="text-sm text-foreground">{q.question}</p>
                  </div>
                  <div className="ml-6 text-xs space-y-1">
                    <p className="text-muted-foreground">你的答案: <span className={isCorrect ? "text-[hsl(var(--success))]" : "text-destructive"}>{answers[i] !== undefined ? q.options[answers[i] as number] : "未作答"}</span></p>
                    {!isCorrect && <p className="text-[hsl(var(--success))]">正确答案: {q.options[q.answer]}</p>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">考试题库</h1>
        <p className="text-muted-foreground mt-1">在线测评与练习，检验学习成果</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("papers")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            tab === "papers" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> 试卷列表</span>
        </button>
        <button
          onClick={() => setTab("bank")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            tab === "bank" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> 题库练习</span>
        </button>
      </div>

      {tab === "papers" ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {examPapers.map((exam) => (
            <Card key={exam.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{exam.name}</h3>
                  {exam.status === "completed" ? (
                    <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 text-xs">已完成</Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">可参加</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>{exam.course}</span>
                  <span>{exam.questions}题</span>
                  <span>{exam.time}分钟</span>
                  <Badge variant="secondary" className="text-xs">{exam.difficulty}</Badge>
                </div>
                {exam.status === "completed" && "score" in exam ? (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-sm font-semibold text-foreground">得分: {exam.score}</span>
                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                      查看详情 <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setView("taking"); setCurrentQuestion(0); setAnswers({}) }}
                    className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    开始考试
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {questionBank.map((q) => (
            <Card key={q.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="text-xs">{q.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{q.course}</Badge>
                      <Badge variant="secondary" className={cn("text-xs",
                        q.difficulty === "简单" ? "text-[hsl(var(--success))]" :
                        q.difficulty === "中等" ? "text-[hsl(var(--warning))]" : "text-destructive"
                      )}>{q.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{q.question}</p>
                    {"options" in q && q.options && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <span key={oi} className="text-xs text-muted-foreground px-3 py-1.5 bg-secondary rounded-lg">
                            {String.fromCharCode(65 + oi)}. {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
