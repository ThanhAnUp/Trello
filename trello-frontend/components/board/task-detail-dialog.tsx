"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Flag, Save, Edit, X, Trash2, Paperclip, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Separator } from "@radix-ui/react-select"
import { BoardItem } from "../dashboard/boards-grid"

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

interface RepoInfo {
    issues: { title: string; issueNumber: number }[];
    pulls: { title: string; pullNumber: number }[];
    commits: { sha: string; message: string }[];
}

interface Attachment {
    attachmentId: string;
    type: 'pull_request' | 'commit' | 'issue';
    ref?: string;
    number?: string;
    sha?: string;
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

    const [boardDetails, setBoardDetails] = useState<BoardItem | null>(null);
    const [repoData, setRepoData] = useState<RepoInfo | null>(null);
    const [isFetchingRepoData, setIsFetchingRepoData] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [attachmentType, setAttachmentType] = useState<'pull_request' | 'issue' | 'commit'>('issue');
    const [attachmentRef, setAttachmentRef] = useState('');
    const { toast } = useToast()

    useEffect(() => {
        if (task && open) {
            setEditedTask({ ...task });
            setIsEditing(false);

            const fetchData = async () => {
                try {
                    setIsLoading(true);

                    const boardDetailsPromise = api.get(`/boards/${boardId}`);
                    const attachmentsPromise = api.get(`/boards/${boardId}/tasks/${task.id}/github-attachments`);

                    const [boardDetailsResponse, attachmentsResponse] = await Promise.all([
                        boardDetailsPromise,
                        attachmentsPromise
                    ]);

                    const boardData = boardDetailsResponse.data;
                    setBoardDetails(boardData);
                    setAttachments(attachmentsResponse.data);

                    if (boardData?.linkedRepo) {
                        setIsFetchingRepoData(true);
                        const { owner, repo } = boardData.linkedRepo;
                        const repoInfoRes = await api.get(`/repositories/${owner}/${repo}/github-info`);
                        setRepoData(repoInfoRes.data);
                    }

                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu chi tiết task:", error);
                    toast({
                        variant: "destructive",
                        title: "Lỗi",
                        description: "Không thể tải dữ liệu cần thiết cho task này."
                    });
                } finally {
                    setIsLoading(false);
                    setIsFetchingRepoData(false);
                }
            };

            fetchData();
        }
    }, [task, open, boardId]);

    if (!task || !editedTask) return null

    const getAttachmentUrl = (attachment: Attachment): string => {
        if (!boardDetails?.linkedRepo) return '#';
        const { owner, repo } = boardDetails.linkedRepo;
        const ref = attachment.number || attachment.sha;

        switch (attachment.type) {
            case 'issue':
            case 'pull_request':
                return `https://github.com/${owner}/${repo}/issues/${ref}`;
            case 'commit':
                return `https://github.com/${owner}/${repo}/commit/${ref}`;
            default:
                return '#';
        }
    };

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

    const handleAttach = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attachmentRef.trim() || !task) return;
        try {
            const payload = { type: attachmentType, ref: attachmentRef };
            const response = await api.post(`/boards/${boardId}/tasks/${task.id}/github-attach`, payload);
            setAttachments(prev => [...prev, response.data]);
            setAttachmentRef('');
            toast({ title: "Thành công", description: "Đã đính kèm liên kết." });
        } catch (error) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể đính kèm." });
        }
    };

    const handleRemoveAttachment = async (attachmentId: string) => {
        if (!task) return;
        try {
            await api.delete(`/boards/${boardId}/tasks/${task.id}/github-attachments/${attachmentId}`);
            setAttachments(prev => prev.filter(att => att.attachmentId !== attachmentId));
            toast({ title: "Thành công", description: "Đã gỡ đính kèm." });
        } catch (error) {
            console.error("Lỗi khi gỡ đính kèm:", error);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể gỡ đính kèm." });
        }
    };

    const renderAttachmentSelector = () => {
        if (!boardDetails?.linkedRepo) {
            return <p className="text-xs text-muted-foreground p-2">Vui lòng liên kết một repository với board này để sử dụng tính năng này.</p>;
        }
        if (isFetchingRepoData) {
            return <p className="text-xs text-muted-foreground p-2">Đang tải danh sách...</p>;
        }
        if (!repoData) {
            return <p className="text-xs text-red-500 p-2">Không thể tải dữ liệu từ repository.</p>;
        }

        let options: { value: string; label: string; }[] = [];
        const commonClasses = "line-clamp-1";

        switch (attachmentType) {
            case 'issue':
                options = repoData.issues.map(i => ({ value: i.issueNumber.toString(), label: `#${i.issueNumber} - ${i.title}` }));
                break;
            case 'pull_request':
                options = repoData.pulls.map(p => ({ value: p.pullNumber.toString(), label: `#${p.pullNumber} - ${p.title}` }));
                break;
            case 'commit':
                options = repoData.commits.map(c => ({ value: c.sha, label: `${c.sha.substring(0, 7)} - ${c.message}` }));
                break;
        }

        return (
            <Select onValueChange={setAttachmentRef}>
                <SelectTrigger>
                    <SelectValue placeholder="Chọn một mục để đính kèm..." />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                    {options.length > 0 ? options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className={commonClasses}>{opt.label}</span>
                        </SelectItem>
                    )) : <div className="p-2 text-center text-xs text-muted-foreground">Không có mục nào.</div>}
                </SelectContent>
            </Select>
        );
    };

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
                <div className="space-y-4 pt-4 mt-4 border-t">
                    <Label className="text-sm font-medium flex items-center">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Đính kèm từ GitHub
                    </Label>

                    <div className="space-y-2">
                        {attachments.map(att => (
                            <a 
                                key={att.attachmentId} 
                                href={getAttachmentUrl(att)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 border rounded-md text-sm hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center overflow-hidden">
                                    <span className="font-semibold capitalize">{att.type.replace('_', ' ')}: </span>
                                    <span className="font-mono text-blue-600 ml-2 truncate">#{att.number || att.sha?.substring(0, 7)}</span>
                                    <ExternalLink className="h-3 w-3 ml-2 text-muted-foreground" />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 flex-shrink-0" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveAttachment(att.attachmentId);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500"/>
                                </Button>
                            </a>
                        ))}
                    </div>

                    <form onSubmit={handleAttach} className="flex items-end space-x-2">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="type" className="text-xs">Loại</Label>
                            <Select value={attachmentType} onValueChange={(v: any) => { setAttachmentType(v); setAttachmentRef(''); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="issue">Issue</SelectItem>
                                    <SelectItem value="pull_request">Pull Request</SelectItem>
                                    <SelectItem value="commit">Commit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-grow-[2]">
                            <Label htmlFor="ref-selector" className="text-xs">Chọn mục</Label>
                            {renderAttachmentSelector()}
                        </div>
                        <Button type="submit" disabled={!attachmentRef}>Đính kèm</Button>
                    </form>
                </div>
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
