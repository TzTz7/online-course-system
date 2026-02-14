"use client"

import { useState } from "react"
import { Video, Users, Clock, Mic, MicOff, VideoOff, MonitorUp, Hand, MessageSquare, PhoneOff, Calendar, Play, Radio } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const liveClasses = [
  {
    id: 1,
    name: "高等数学 - 微分方程专题",
    teacher: "张教授",
    time: "今天 14:00-15:30",
    students: 156,
    status: "live" as const,
  },
  {
    id: 2,
    name: "数据结构 - 平衡二叉树",
    teacher: "李教授",
    time: "今天 16:00-17:30",
    students: 0,
    status: "upcoming" as const,
  },
  {
    id: 3,
    name: "计算机网络 - HTTP/2与QUIC协议",
    teacher: "王教授",
    time: "明天 09:00-10:30",
    students: 0,
    status: "upcoming" as const,
  },
  {
    id: 4,
    name: "人工智能 - 卷积神经网络",
    teacher: "陈教授",
    time: "明天 14:00-15:30",
    students: 0,
    status: "upcoming" as const,
  },
]

const recordedClasses = [
  { id: 1, name: "高等数学 - 不定积分", teacher: "张教授", duration: "87分钟", views: 342, date: "2026-02-10" },
  { id: 2, name: "数据结构 - 快速排序", teacher: "李教授", duration: "92分钟", views: 289, date: "2026-02-08" },
  { id: 3, name: "计算机网络 - DNS解析", teacher: "王教授", duration: "78分钟", views: 198, date: "2026-02-06" },
]

export function ClassroomContent() {
  const [inMeeting, setInMeeting] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [handRaised, setHandRaised] = useState(false)
  const [tab, setTab] = useState<"live" | "recorded">("live")

  if (inMeeting) {
    return (
      <div className="flex flex-col h-screen bg-foreground">
        {/* Meeting header */}
        <div className="flex items-center justify-between px-4 py-3 bg-foreground/90 text-primary-foreground shrink-0">
          <div className="flex items-center gap-2 pt-12 md:pt-0">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-medium">高等数学 - 微分方程专题</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 156</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 01:23:45</span>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-1 p-1">
          {/* Main video */}
          <div className="md:col-span-3 bg-foreground/80 rounded-lg flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary-foreground/60">张</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">张教授 正在讲授</p>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge className="bg-destructive text-destructive-foreground text-xs">LIVE</Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-primary-foreground/50">张教授的屏幕</span>
              <button className="text-xs text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1">
                <MonitorUp className="w-3 h-3" /> 全屏
              </button>
            </div>
          </div>

          {/* Participants sidebar */}
          <div className="hidden md:flex flex-col gap-1">
            {["李同学", "王同学", "赵同学", "我"].map((name, i) => (
              <div key={i} className="bg-foreground/80 rounded-lg flex-1 flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground/60">{name[0]}</span>
                </div>
                <span className="absolute bottom-1 left-2 text-[10px] text-primary-foreground/50">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 p-4 bg-foreground/90 shrink-0">
          <button
            onClick={() => setMicOn(!micOn)}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
              micOn ? "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"
            )}
            aria-label={micOn ? "关闭麦克风" : "开启麦克风"}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
              camOn ? "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"
            )}
            aria-label={camOn ? "关闭摄像头" : "开启摄像头"}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
              handRaised ? "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]" : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            )}
            aria-label="举手"
          >
            <Hand className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors" aria-label="聊天">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setInMeeting(false)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            aria-label="退出课堂"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">在线课堂</h1>
        <p className="text-muted-foreground mt-1">实时互动教学，随时随地参与课堂</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("live")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            tab === "live" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2"><Radio className="w-4 h-4" /> 实时课堂</span>
        </button>
        <button
          onClick={() => setTab("recorded")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            tab === "recorded" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2"><Play className="w-4 h-4" /> 课程录播</span>
        </button>
      </div>

      {tab === "live" ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {liveClasses.map((cls) => (
            <Card key={cls.id} className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className={cn(
                  "h-32 flex items-center justify-center relative",
                  cls.status === "live" ? "bg-primary/5" : "bg-muted/50"
                )}>
                  <Video className={cn("w-10 h-10", cls.status === "live" ? "text-primary/30" : "text-muted-foreground/20")} />
                  {cls.status === "live" && (
                    <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs animate-pulse">
                      <Radio className="w-3 h-3 mr-1" /> 直播中
                    </Badge>
                  )}
                  {cls.status === "upcoming" && (
                    <Badge variant="secondary" className="absolute top-3 left-3 text-xs">
                      <Calendar className="w-3 h-3 mr-1" /> 即将开始
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{cls.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{cls.teacher}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</span>
                    {cls.students > 0 && (
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.students}人</span>
                    )}
                  </div>
                  {cls.status === "live" ? (
                    <button
                      onClick={() => setInMeeting(true)}
                      className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      进入课堂
                    </button>
                  ) : (
                    <button className="w-full py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                      预约提醒
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recordedClasses.map((cls) => (
            <Card key={cls.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Play className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{cls.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{cls.teacher}</span>
                      <span>{cls.duration}</span>
                      <span>{cls.views}次观看</span>
                      <span>{cls.date}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0">
                    播放
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
