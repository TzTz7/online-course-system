"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SectionDetail } from "@/lib/course-actions/section"

export function SectionViewer({ section }: { section: SectionDetail }) {
  const [textContent, setTextContent] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const isPdf = section.content_type === "text" && section.content.endsWith(".pdf")
  const isTxt = section.content_type === "text" && section.content.endsWith(".txt")

  // 加载 txt 文件内容
  useEffect(() => {
    if (isTxt && section.content) {
      setLoading(true)
      fetch(section.content)
        .then(res => res.text())
        .then(text => {
          setTextContent(text)
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to load text content:", err)
          setLoading(false)
        })
    }
  }, [isTxt, section.content])

  return (
    <div className="p-4 pt-16 md:pt-6 md:p-6 space-y-6">
      <Link href={`/courses/${section.course_id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回课程
      </Link>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-foreground">{section.title}</h1>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Video 类型 */}
          {section.content_type === "video" && (
            <div className="w-full">
              <video 
                src={section.content} 
                controls 
                className="w-full max-h-[600px] bg-black"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          )}

          {/* Text 类型 - TXT 文件 */}
          {isTxt && (
            <div className="h-[600px] overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">加载中...</div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {/* Text 类型 - PDF 文件 */}
          {isPdf && (
            <div className="space-y-4">
              <div className="h-[600px] overflow-y-auto">
                <embed 
                  src={section.content} 
                  type="application/pdf" 
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 border-t border-border/50">
                <a 
                  href={section.content} 
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载 PDF
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
