"use client"

import type React from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="flex max-w-full overflow-hidden">
        <Sidebar />
        <main className="p-6 grow w-0">{children}</main>
      </div>
    </div>
  )
}
