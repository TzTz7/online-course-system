"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, User, Send, Loader2, GraduationCap, BookOpen, Radio, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const roles = [
  {
    id: "robot-teacher",
    name: "智教授",
    subtitle: "AI机器人教师",
    description: "丰富教学经验，循序渐进讲解知识，主动出题考察",
    icon: GraduationCap,
    color: "bg-primary",
    greeting: "同学你好！我是智教授，今天想学习什么知识呢？我会根据你的水平来调整讲解难度。",
  },
  {
    id: "robot-student",
    name: "小智",
    subtitle: "AI机器人学生",
    description: "好奇心强、爱提问，模拟真实学生的学习过程",
    icon: User,
    color: "bg-accent",
    greeting: "嗨！我是小智，我也在学习中。我们可以一起讨论问题！有什么你想聊的吗？",
  },
  {
    id: "robot-course",
    name: "课程助手",
    subtitle: "AI课程机器人",
    description: "按课程大纲系统讲解，每节小测验巩固知识",
    icon: BookOpen,
    color: "bg-[hsl(var(--success))]",
    greeting: "你好！我是课程助手，我会按照课程大纲系统地为你讲解知识点。准备好开始学习了吗？",
  },
  {
    id: "robot-classroom",
    name: "课堂管家",
    subtitle: "AI课堂机器人",
    description: "模拟课堂环境，课前预习、课堂互动、课后复习",
    icon: Radio,
    color: "bg-[hsl(var(--warning))]",
    greeting: "欢迎来到智慧课堂！我是课堂管家，将为你提供完整的课堂体验：课前预习、课中互动、课后复习。",
  },
]

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AiRolesContent() {
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const selectedRole = roles.find((r) => r.id === activeRole)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          role: activeRole,
        },
      }),
    }),
  })

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

  const handleSelectRole = (roleId: string) => {
    setActiveRole(roleId)
    setMessages([])
    setInput("")
  }

  if (!activeRole || !selectedRole) {
    return (
      <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI智能角色</h1>
          <p className="text-muted-foreground mt-1">选择不同的AI角色，体验多样化的智能教学互动</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleSelectRole(role.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-2xl text-primary-foreground group-hover:scale-110 transition-transform",
                    role.color
                  )}>
                    <role.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                    <p className="text-xs text-muted-foreground">{role.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  <span>点击开始对话</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50 shadow-sm bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">关于AI角色系统</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  我们的AI角色系统基于深度学习技术，每个角色都有独特的个性和教学风格。
                  机器人教师善于讲解，机器人学生善于提问，课程助手系统化教学，课堂管家模拟完整课堂体验。
                  选择适合你的角色，开始智能学习之旅。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 pt-16 md:pt-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveRole(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 返回
          </button>
          <div className="h-5 w-px bg-border" />
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl text-primary-foreground", selectedRole.color)}>
            <selectedRole.icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{selectedRole.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedRole.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Greeting message */}
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl text-primary-foreground shrink-0", selectedRole.color)}>
              <selectedRole.icon className="w-4 h-4" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3 bg-card border border-border text-sm text-card-foreground leading-relaxed">
              {selectedRole.greeting}
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
                isUser ? "bg-secondary text-secondary-foreground" : cn(selectedRole.color, "text-primary-foreground")
              )}>
                {isUser ? <User className="w-4 h-4" /> : <selectedRole.icon className="w-4 h-4" />}
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
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl text-primary-foreground shrink-0", selectedRole.color)}>
              <selectedRole.icon className="w-4 h-4" />
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
            placeholder={`与${selectedRole.name}对话...`}
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
