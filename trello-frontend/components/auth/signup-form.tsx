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
import { OTPVerificationModal } from "./otp-verification-modal";
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store"

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenSendOtp, setIsOpenSendOtp] = useState(false);
  const {fetchUser} = useUserStore();
  const { toast } = useToast()
  const router = useRouter()

  const handleSendOTP = async (email: string) => {
    setIsLoading(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`,
        {
          email
        },
        {
          withCredentials: true,
        }
      );
      setIsOpenSendOtp(true)
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.",
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      const res = await api.request({
        url: '/auth/verify-otp',
        data: {
          name,
          email,
          password,
          code
        },
        method: 'post'
      })
      if (res.data.success) {
        await fetchUser()
        router.push("/");
        return {
          success: res.data.success
        }
      } else {
        toast({
          title: 'Thành công',
          description: "Xác thực thành công",
          variant: 'destructive'
        })
        return {
          success: false
        }
      }
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: "Xác thực thất bại.",
        variant: 'destructive'
      })
      return {
        success: false
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await handleSendOTP(email)
  }

  return (
    <Card className="w-full">
      <OTPVerificationModal
        email={email}
        isOpen={isOpenSendOtp}
        onClose={() => setIsOpenSendOtp(false)}
        onVerifySuccess={() => { }}
        onResendOTP={async () => {
          return { success: true };
        }}
        onVerifyOTP={async (otp: string) => {
          const rs = await handleVerifyOTP(otp)
          return rs
        }}
      />
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Trello className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
        <CardDescription>Tham gia TaskBoard ngay</CardDescription>
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
