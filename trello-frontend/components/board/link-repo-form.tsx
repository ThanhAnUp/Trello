"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Github } from "lucide-react";

interface LinkRepoFormProps {
    boardId: string;
    currentRepo?: { owner: string; repo: string };
    onSuccess: () => void;
}

export function LinkRepoForm({ boardId, currentRepo, onSuccess }: LinkRepoFormProps) {
    const [owner, setOwner] = useState(currentRepo?.owner || "");
    const [repo, setRepo] = useState(currentRepo?.repo || "");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!owner.trim() || !repo.trim()) {
            toast({ title: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            await api.post(`/boards/${boardId}/link-repo`, { owner, repo });
            toast({ title: "Thành công", description: "Đã liên kết repository thành công." });
            onSuccess();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể liên kết repository.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <h3 className="font-semibold flex items-center text-lg">
                <Github className="w-5 h-5 mr-2"/> 
                Liên kết Repository GitHub
            </h3>
            <p className="text-sm text-black/50">
               EX: https://github.com/facebook/react
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="owner">Chủ sở hữu (Owner)</Label>
                    <Input id="owner" placeholder="Ex: facebook" value={owner} onChange={(e) => setOwner(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="repo">Tên Repository</Label>
                    <Input id="repo" placeholder="Ex: react" value={repo} onChange={(e) => setRepo(e.target.value)} />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang lưu..." : "Lưu liên kết"}
                </Button>
            </div>
        </form>
    );
}