import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_SC } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansSC = Noto_Sans_SC({ subsets: ['latin'], variable: '--font-noto-sc', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'SmartEdu - AI智慧教学平台',
  description: '基于人工智能的在线课程教学系统，提供智能辅导、在线课堂、试卷考试、AI机器人教学等功能',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
