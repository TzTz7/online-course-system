"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Brain, Send, BookOpen, Lightbulb, HelpCircle, Sparkles, User, Bot, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const subjects = [
  { id: "math", label: "高等数学", icon: "f(x)" },
  { id: "ds", label: "数据结构", icon: "{}" },
  { id: "network", label: "计算机网络", icon: "TCP" },
  { id: "ai", label: "人工智能", icon: "AI" },
]

const quickQuestions = [
  { text: "请解释极限的epsilon-delta定义", icon: HelpCircle },
  { text: "二叉树的前序遍历怎么实现？", icon: Lightbulb },
  { text: "TCP三次握手的详细过程是什么？", icon: BookOpen },
  { text: "什么是反向传播算法？", icon: Sparkles },
]

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AiTutorChat() {
  const [activeSubject, setActiveSubject] = useState("math")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const [input, setInput] = useState("")

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    const text = input
    setInput("")
    sendMessage({ text })
  }

  const handleQuickQuestion = (text: string) => {
    if (isStreaming) return
    sendMessage({ text })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 pt-16 md:pt-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI智能辅导</h1>
            <p className="text-xs text-muted-foreground">基于深度学习的一对一智能答疑</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setActiveSubject(sub.id)
                setMessages([])
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                activeSubject === sub.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <span className="font-mono text-[10px] opacity-70">{sub.icon}</span>
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Brain className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">AI辅导助手</h2>
              <p className="text-sm text-muted-foreground mt-1">选择一个学科，向我提问任何问题</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <q.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="line-clamp-2">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const text = getMessageText(msg)
          if (!text) return null
          const isUser = msg.role === "user"
          return (
            <div key={msg.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl shrink-0",
                isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
              )}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                isUser
                  ? "bg-primary text-primary-foreground rounded-tr-md"
                  : "bg-card border border-border text-card-foreground rounded-tl-md"
              )}>
                <div className="whitespace-pre-wrap">{text}</div>
              </div>
            </div>
          )
        })}

        {isStreaming && messages.length > 0 && !getMessageText(messages[messages.length - 1]) && (
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
            aria-label="发送消息"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
