"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Users, Hash, Plus, Search, Smile, AtSign, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import type { Category } from "@/lib/definitions"

interface ChatMessage {
  id: string
  user_id: string
  category_id: string
  content: string
  created_at: string
  user?: {
    id: string
    name: string
    avatar: string | null
  }
}

interface ChatUser {
  id: string
  name: string
  avatar: string | null
  role: string
  status: string
}

export function ChatRoomContent() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<Category[]>([])
  const [activeChannel, setActiveChannel] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [input, setInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const activeChannelInfo = channels.find((c) => c.id === activeChannel)
  const currentUserId = session?.user?.id

  // 获取频道列表
  useEffect(() => {
    fetch("/api/chatroom/channels")
      .then((res) => res.json())
      .then((data) => {
        if (data.channels?.length > 0) {
          setChannels(data.channels)
          setActiveChannel(data.channels[0].id)
        }
      })
      .catch(console.error)
  }, [])

  // 获取用户列表
  useEffect(() => {
    fetch("/api/chatroom/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users)
        }
      })
      .catch(console.error)
  }, [])

  // 获取消息 + SSE 订阅
  useEffect(() => {
    if (!activeChannel) return

    setLoading(true)

    // 获取历史消息
    fetch(`/api/chatroom/messages?categoryId=${activeChannel}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || [])
        setLoading(false)
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // 关闭旧的 SSE 连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // 建立新的 SSE 连接
    const eventSource = new EventSource(`/api/chatroom/sse?categoryId=${activeChannel}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const newMessage: ChatMessage = JSON.parse(event.data)
        setMessages((prev) => {
          // 去重：根据 id 判断是否已存在
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev
          }
          return [...prev, newMessage]
        })
      } catch (error) {
        console.error("Failed to parse SSE message:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [activeChannel])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !activeChannel || !session) return

    const content = input.trim()
    setInput("")

    try {
      const res = await fetch("/api/chatroom/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: activeChannel,
          content: content,
        }),
      })

      if (!res.ok) {
        console.error("Failed to send message")
      }
      // 消息会通过 SSE 推送回来，不需要手动添加
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  }

  const getInitials = (name: string) => {
    return name?.[0]?.toUpperCase() || "?"
  }

  return (
    <div className="flex h-screen">
      {/* Channel sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 bg-card border-r border-border flex flex-col transition-transform md:relative md:translate-x-0",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 pt-16 md:pt-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> 聊天频道
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChannel(ch.id)
                setShowSidebar(false)
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                activeChannel === ch.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Hash className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 pt-16 md:pt-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <Hash className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              {activeChannelInfo?.name || "选择频道"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="搜索"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              暂无消息，开始聊天吧
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user?.id === currentUserId
              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", isMe && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium shrink-0",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {getInitials(msg.user?.name || "?")}
                  </div>
                  <div className={cn("max-w-[70%]", isMe && "text-right")}>
                    <div
                      className={cn(
                        "flex items-center gap-2 mb-1",
                        isMe && "flex-row-reverse"
                      )}
                    >
                      <span className="text-xs font-medium text-foreground">
                        {msg.user?.name || "未知用户"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed inline-block text-left",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-md"
                          : "bg-card border border-border text-card-foreground rounded-tl-md"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
              aria-label="添加文件"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  session
                    ? `#${activeChannelInfo?.name || "选择频道"} 中发送消息...`
                    : "请先登录后聊天"
                }
                disabled={!session}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="@提及"
              >
                <AtSign className="w-4 h-4" />
              </button>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="表情"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !session}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
              aria-label="发送消息"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users sidebar - desktop only */}
      <div className="hidden lg:flex flex-col w-52 border-l border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            注册成员 - {users.length}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="relative">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                  {getInitials(user.name)}
                </div>
              </div>
              <span className="text-xs text-foreground truncate">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
