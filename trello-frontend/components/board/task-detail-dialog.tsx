"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Flag, Save, Edit, X, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Separator } from "@radix-ui/react-select"

interface Task {
    id: string
    title: string
    description: string
    assigneeId: string
    priority: "low" | "medium" | "high"
    dueDate: string
    status: string
    order: number
}

function getChangedFields(original: Task, edited: Task): Partial<Task> {
    const changes: Partial<Task> = {};
    Object.keys(edited).forEach(key => {
        const taskKey = key as keyof Task;
        if (original[taskKey] !== edited[taskKey]) {
            (changes as any)[taskKey] = edited[taskKey];
        }
    });
    return changes;
}

interface TaskDetailDialogProps {
    task: Task | null
    open: boolean
    onOpenChange: (open: boolean) => void
    boardId: string
}

const mockUsers = ["Thành An 1", "Thành An 2", "Thành An 3"]

export function TaskDetailDialog({ task, open, onOpenChange, boardId }: TaskDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedTask, setEditedTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (task) {
            setEditedTask({ ...task })
            setIsEditing(false);
        }
    }, [task])

    if (!task || !editedTask) return null

    const handleSave = async () => {
        if (!editedTask) return;

        const changes = getChangedFields(task, editedTask);
        if (Object.keys(changes).length === 0) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await api.patch(`/boards/${boardId}/tasks/${task.id}`, changes);

            toast({
                title: "Thành công!",
                description: "Thay đổi của bạn đã được lưu.",
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật task:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật task. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancel = () => {
        setEditedTask({ ...task })
        setIsEditing(false)
    }

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await api.delete(`/boards/${boardId}/tasks/${task.id}`);

            toast({
                title: "Đã xóa",
                description: "Task đã được xóa thành công.",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi khi xóa task:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa task. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const priorityColors = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
    }

    const statusOptions = [
        { value: "icebox", label: "Icebox" },
        { value: "backlog", label: "Backlog" },
        { value: "ongoing", label: "In Progress" },
        { value: "review", label: "Review" },
        { value: "done", label: "Done" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                            {isEditing ? (
                                <Input
                                    value={editedTask.title}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
                                    placeholder="Task title"
                                />
                            ) : (
                                <DialogTitle className="text-xl pr-8">{task.title}</DialogTitle>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mr-8">
                            {isEditing ? (
                                <>
                                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isLoading ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancel}>
                                        <X className="h-4 w-4 mr-2" />
                                        Thoát
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium flex items-center mb-2">
                            <User className="h-4 w-4 mr-2" />
                            Người thực hiện
                        </Label>
                        {isEditing ? (
                            <Select
                                value={editedTask.assigneeId}
                                onValueChange={(value) => setEditedTask({ ...editedTask, assigneeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockUsers.map((user) => (
                                        <SelectItem key={user} value={user}>
                                            {user}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex items-center space-x-2 p-2 border rounded-md">
                                <User />
                                <span className="text-sm">{task.assigneeId}</span>
                            </div>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <Label className="text-sm font-medium flex items-center mb-2">
                            <Flag className="h-4 w-4 mr-2" />
                            Ưu tiên
                        </Label>
                        {isEditing ? (
                            <Select
                                value={editedTask.priority}
                                onValueChange={(value: "low" | "medium" | "high") =>
                                    setEditedTask({ ...editedTask, priority: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={priorityColors[task.priority]} variant="secondary">
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                        )}
                    </div>

                    <Separator />
                    <div>
                        <Label className="text-sm font-medium flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            Ngày hết hạn
                        </Label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={editedTask.dueDate}
                                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                            />
                        ) : (
                            <div className="p-2 border rounded-md text-sm">{new Date(task.dueDate).toLocaleDateString()}</div>
                        )}
                    </div>

                    <Separator />
                    <div>
                        <Label className="text-sm font-medium flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-2" />
                            Trạng thái
                        </Label>
                        {isEditing ? (
                            <Select
                                value={editedTask.status}
                                onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge variant="outline" className="capitalize">
                                {statusOptions.find((s) => s.value === task.status)?.label || task.status}
                            </Badge>
                        )}
                    </div>

                    <Separator />
                    <div className="space-y-2">
                        <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
                            Delete Task
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
