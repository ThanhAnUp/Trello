"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { LogIn } from "lucide-react";

interface JoinBoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (joinedBoardId: string) => void;
}

export function JoinBoardDialog({ open, onOpenChange, onSuccess }: JoinBoardDialogProps) {
    const [boardId, setBoardId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boardId.trim()) {
            toast({ title: "Vui lòng nhập ID của board", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {

            await api.post(`/boards/${boardId.trim()}/join`);

            toast({
                title: "Thành công!",
                description: "Bạn đã tham gia board thành công.",
            });
            
            onSuccess(boardId.trim());
            setBoardId("");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Lỗi khi tham gia board:", error);
            const errorMessage = error.response?.data?.message || "Không thể tham gia board. ID có thể không tồn tại.";
            toast({
                title: "Lỗi",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tham gia một Board</DialogTitle>
                    <DialogDescription>
                        Dán ID của board bạn muốn tham gia vào ô bên dưới.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="board-id">Board ID</Label>
                            <Input
                                id="board-id"
                                placeholder="Nhập ID của board..."
                                value={boardId}
                                onChange={(e) => setBoardId(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            <LogIn className="h-4 w-4 mr-2" />
                            {isLoading ? "Đang xử lý..." : "Tham gia"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}