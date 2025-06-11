"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trello } from "lucide-react"
import { api } from "@/lib/api"

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.request({
        url: '/auth/register',
        method: 'post',
        data: {
          email,
          password,
          name
        }
      })

      const data = response.data;

      if (data.success) {
        router.push("/dashboard")
      } else {

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
        <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
        <CardDescription>Tham gia TaskBoard ngay</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
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
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Bạn đã có tài khoản?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
