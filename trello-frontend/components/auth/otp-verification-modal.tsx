"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onVerifySuccess: (data: any) => void
  onResendOTP: () => Promise<{ success: boolean; error?: string }>
  onVerifyOTP: (otp: string) => Promise<{ success: boolean; error?: string; data?: any }>
  title?: string
  description?: string
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  email,
  onVerifySuccess,
  onResendOTP,
  onVerifyOTP,
  title = "Xác thực OTP",
  description = "Nhập mã xác thực đã được gửi đến tài khoản gmail của bạn",
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const { toast } = useToast()

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const otpLength = 6

  useEffect(() => {
    if (isOpen) {
      setCountdown(60)
      setOtp("")
      setError(null)
      setAttempts(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [isOpen])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = otp.split("")
    newOtp[index] = value
    const updatedOtp = newOtp.join("")

    setOtp(updatedOtp)
    setError(null)

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (updatedOtp.length === otpLength) {
      handleVerifyOTP(updatedOtp)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "")

    if (pastedData.length === otpLength) {
      setOtp(pastedData)
      setError(null)
      handleVerifyOTP(pastedData)
    }
  }

  const handleVerifyOTP = async (otpCode: string = otp) => {
    if (otpCode.length !== otpLength) {
      setError("Vui lòng nhập đầy đủ mã OTP")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const result = await onVerifyOTP(otpCode)
      if (result.success) {
        toast({
          title: "Xác thực thành công",
          description: "Mã OTP đã được xác thực thành công",
        })
        onVerifySuccess(result.data)
        onClose()
      } else {
        setAttempts((prev) => prev + 1)
        setError(result.error || "Mã OTP không hợp lệ")
        setOtp("")

        setTimeout(() => {
          inputRefs.current[0]?.focus()
        }, 100)
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError(null)

    try {
      const result = await onResendOTP()

      if (result.success) {
        setCountdown(60)
        setOtp("")
        setAttempts(0)
        toast({
          title: "Mã OTP đã được gửi lại",
          description: "Vui lòng kiểm tra tin nhắn của bạn",
        })

        setTimeout(() => {
          inputRefs.current[0]?.focus()
        }, 100)
      } else {
        setError(result.error || "Không thể gửi lại mã OTP")
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi gửi lại mã OTP")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {attempts >= 3 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">Mã xác thực (OTP)</Label>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: otpLength }).map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={isVerifying || isResending}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Nhập mã {otpLength} số đã được gửi đến tài khoản gmail của bạn
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Không nhận được mã?</span>
            <Button
              variant="link"
              size="sm"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isResending || isVerifying}
              className="p-0 h-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Đang gửi...
                </>
              ) : countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                "Gửi lại mã"
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col">
          <Button
            onClick={() => handleVerifyOTP()}
            disabled={otp.length !== otpLength || isVerifying || isResending}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác thực"
            )}
          </Button>

          <Button variant="outline" onClick={onClose} className="w-full">
            Hủy
          </Button>
        </DialogFooter>

        <div className="text-center text-xs text-muted-foreground">
          <p>Mã OTP có hiệu lực trong 5 phút</p>
          <p>Số lần thử: {attempts}/5</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
