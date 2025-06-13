"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, LayoutDashboard } from "lucide-react"

const navigation = [
  { name: "Trang chủ", href: "/", icon: LayoutDashboard },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-56 bg-white border-r border-gray-200 min-h-screen max-md:hidden">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">TaskBoard</span>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={"ghost"}
                className={"w-fit justify-start border w-full"}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
