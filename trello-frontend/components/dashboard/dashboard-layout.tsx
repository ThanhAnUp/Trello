"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import Link from "next/link"
import { Button } from "../ui/button"
import { LayoutDashboard } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="flex flex-col max-w-full overflow-hidden">
        <div className="flex">
          <Link key={'Home'} href={"/"} className="ml-auto mx-4 mt-4">
            <Button
              variant={"ghost"}
              className={"w-fit justify-start border"}
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Trang chủ
            </Button>
          </Link>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
