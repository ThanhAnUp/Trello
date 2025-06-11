import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WebSocketProvider } from "@/components/providers/websocket-provider"
import { AuthInitializer } from "@/components/auth/authInitializer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trello Mới",
  description: "Cộng tác và quản lý công việc theo thời gian thực cùng với nhóm của bạn.",
  generator: 'Nguyen Thanh An'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthInitializer/>
        <Toaster />
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  )
}
