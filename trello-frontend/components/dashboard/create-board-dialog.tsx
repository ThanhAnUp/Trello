"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "../ui/use-toast"
import { api } from "@/lib/api"

interface CreateBoardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateBoardDialog({ open, onOpenChange }: CreateBoardDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {

            await api.request({
                method: 'post',
                url: '/boards',
                data: {
                    name,
                    description
                }
            })

            toast({
                title: "Đã tạo bảng!",
                description: `${name} Đã được tạo thành công.`,
            })

            setName("")
            setDescription("")
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Lỗi tạo bảng. Vui lòng thử lại.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tạo bảng mới</DialogTitle>
                    <DialogDescription>
                        Tạo một bảng mới để cộng tác với nhóm của bạn.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên bảng</Label>
                            <Input
                                id="name"
                                placeholder="Tên bảng"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Thoát
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang tạo..." : "Tạo bảng"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
