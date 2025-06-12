"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Zap, Globe, Trello } from "lucide-react"
import { useUserStore } from "@/store/user-store"

export function LandingPage() {
  const {user} = useUserStore()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trello className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TaskBoard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href={user ? "/dashboard" : "/auth/signup"}>
              <Button>Bắt đầu ngay</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <section className="py-20 px-4 bg-white grow">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Mọi công cụ bạn cần để quản lý dự án của mình
          </h2>
          <div className="grid md:grid-cols-3 gap-8">

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Cập nhật thời gian thực</CardTitle>
                <CardDescription>Thấy ngay thay đổi khi cả nhóm đang cùng làm việc</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Các cập nhật bằng WebSocket đảm bảo mọi người luôn đồng bộ thông tin với nhau.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Cộng tác nhóm</CardTitle>
                <CardDescription>Làm việc cùng nhau một cách liền mạch và hiệu quả</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Giao việc, đặt mức độ ưu tiên và cùng nhau theo dõi tiến độ dự án.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Kéo & Thả</CardTitle>
                <CardDescription>Quản lý công việc trực quan với tính năng kéo và thả</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Di chuyển các công việc giữa các cột chỉ bằng thao tác kéo thả đơn giản.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trello className="h-6 w-6" />
            <span className="text-xl font-bold">TaskBoard</span>
          </div>
          <p className="text-gray-400">
            Được xây dựng bởi NGUYEN THANH AN.
          </p>
        </div>
      </footer>
    </div>
  )
}