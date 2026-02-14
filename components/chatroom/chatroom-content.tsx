"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Users, Hash, Plus, Search, Smile, AtSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const channels = [
  { id: "general", name: "综合讨论", online: 45 },
  { id: "math", name: "高等数学", online: 23 },
  { id: "ds", name: "数据结构", online: 18 },
  { id: "network", name: "计算机网络", online: 12 },
  { id: "ai", name: "人工智能", online: 31 },
  { id: "help", name: "答疑求助", online: 8 },
]

interface ChatMessage {
  id: number
  user: string
  avatar: string
  content: string
  time: string
  isMe?: boolean
}

const initialMessages: Record<string, ChatMessage[]> = {
  general: [
    { id: 1, user: "李明", avatar: "李", content: "有人知道期中考试的范围吗？", time: "14:23" },
    { id: 2, user: "王芳", avatar: "王", content: "老师说了涵盖前六章内容", time: "14:25" },
    { id: 3, user: "张伟", avatar: "张", content: "数据结构那门也快考了", time: "14:28" },
    { id: 4, user: "赵丽", avatar: "赵", content: "我整理了一份复习笔记，需要的同学私聊我", time: "14:30" },
    { id: 5, user: "陈浩", avatar: "陈", content: "太好了！我正需要，感谢分享", time: "14:32" },
    { id: 6, user: "刘洋", avatar: "刘", content: "有人组队做AI课的项目吗？还差一个成员", time: "14:35" },
  ],
  math: [
    { id: 1, user: "张教授", avatar: "张", content: "同学们，今天的作业已经发布了，截止时间是周五", time: "10:00" },
    { id: 2, user: "李明", avatar: "李", content: "请问第三题的积分怎么换元？", time: "10:15" },
    { id: 3, user: "王芳", avatar: "王", content: "试试令u=sin(x)，然后用分部积分", time: "10:18" },
  ],
  ds: [
    { id: 1, user: "李教授", avatar: "李", content: "下节课讲AVL树，大家预习一下", time: "09:00" },
    { id: 2, user: "周杰", avatar: "周", content: "AVL树的旋转操作有点难理解", time: "09:30" },
  ],
}

const onlineUsers = [
  { name: "李明", status: "online" },
  { name: "王芳", status: "online" },
  { name: "张伟", status: "online" },
  { name: "赵丽", status: "idle" },
  { name: "陈浩", status: "online" },
  { name: "刘洋", status: "online" },
  { name: "周杰", status: "idle" },
  { name: "孙梅", status: "online" },
]

export function ChatRoomContent() {
  const [activeChannel, setActiveChannel] = useState("general")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState(initialMessages)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channelMessages = messages[activeChannel] || []
  const activeChannelInfo = channels.find((c) => c.id === activeChannel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [channelMessages])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: ChatMessage = {
      id: Date.now(),
      user: "我",
      avatar: "我",
      content: input,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }))
    setInput("")
  }

  return (
    <div className="flex h-screen">
      {/* Channel sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 bg-card border-r border-border flex flex-col transition-transform md:relative md:translate-x-0",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 pt-16 md:pt-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> 聊天频道
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => { setActiveChannel(ch.id); setShowSidebar(false) }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                activeChannel === ch.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Hash className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">{ch.name}</span>
              <span className={cn(
                "text-xs",
                activeChannel === ch.id ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>{ch.online}</span>
            </button>
          ))}
        </div>
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 pt-16 md:pt-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="md:hidden text-muted-foreground hover:text-foreground">
              <MessageSquare className="w-5 h-5" />
            </button>
            <Hash className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{activeChannelInfo?.name}</h2>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" /> {activeChannelInfo?.online} 在线
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="搜索">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="成员">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {channelMessages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.isMe && "flex-row-reverse")}>
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium shrink-0",
                msg.isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}>
                {msg.avatar}
              </div>
              <div className={cn("max-w-[70%]", msg.isMe && "text-right")}>
                <div className={cn("flex items-center gap-2 mb-1", msg.isMe && "flex-row-reverse")}>
                  <span className="text-xs font-medium text-foreground">{msg.user}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed inline-block text-left",
                  msg.isMe
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-card border border-border text-card-foreground rounded-tl-md"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0" aria-label="添加文件">
              <Plus className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`在 #${activeChannelInfo?.name} 中发送消息...`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="@提及">
                <AtSign className="w-4 h-4" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="表情">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
              aria-label="发送消息"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Online users sidebar - desktop only */}
      <div className="hidden lg:flex flex-col w-52 border-l border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">在线成员 - {onlineUsers.length}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {onlineUsers.map((user, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors">
              <div className="relative">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                  {user.name[0]}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                  user.status === "online" ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--warning))]"
                )} />
              </div>
              <span className="text-xs text-foreground truncate">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
