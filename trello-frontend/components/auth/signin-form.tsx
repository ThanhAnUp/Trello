"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Trello } from "lucide-react"
import { api } from "@/lib/api"
import { useUserStore } from "@/store/user-store"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const {fetchUser} = useUserStore();
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.request({
        url: '/auth/login',
        method: 'post',
        data: {
          email,
          password,
        }
      })

      const data = response.data;

      if (data.success) {
        await fetchUser()
        router.push('/dashboard')
      }
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Trello className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Chào mừng</CardTitle>
        <CardDescription>Vui lòng đăng nhập để tiếp tục</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`} className="w-full">
            <Button variant="outline" className="w-full">
              <Github className="h-4 w-4 mr-2" />
              Đăng nhập với GitHub
            </Button>
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {"Bạn chưa có tài khoản? "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
