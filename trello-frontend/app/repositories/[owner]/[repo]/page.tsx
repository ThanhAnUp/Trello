"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface RepoInfo {
    repositoryId: string;
    branches: { name: string; lastCommitSha: string }[];
    pulls: { title: string; pullNumber: number }[];
    issues: { title: string; issueNumber: number }[];
    commits: { sha: string; message: string }[];
}

export default function RepositoryInfoPage() {
    const params = useParams();
    const owner = params.owner as string;
    const repo = params.repo as string;

    const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!owner || !repo) return;

        const fetchRepoInfo = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/repositories/${owner}/${repo}/github-info`);
                setRepoInfo(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin repository:", err);
                setError("Không thể tải thông tin. Vui lòng kiểm tra lại hoặc đảm bảo bạn đã liên kết tài khoản GitHub.");
            } finally {
                setLoading(false);
            }
        };

        fetchRepoInfo();
    }, [owner, repo]);

    if (loading) return <div className="p-10 text-center">Đang tải thông tin repository...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!repoInfo) return <div className="p-10 text-center">Không có dữ liệu.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Link href="/dashboard">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Dashboard
                </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Repository: {repoInfo.repositoryId}</h1>
            <p className="text-muted-foreground mb-8">Tổng quan về các hoạt động gần đây trên GitHub.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branches */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branches ({repoInfo.branches.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <ul>
                            {repoInfo.branches.map(b => (
                                <li key={b.name} className="p-2 border-b">
                                    <p className="font-semibold">{b.name}</p>
                                    <p className="text-xs text-muted-foreground">Last Commit: {b.lastCommitSha.substring(0, 7)}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Pull Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pull Requests ({repoInfo.pulls.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <ul>
                            {repoInfo.pulls.map(p => (
                                <li key={p.pullNumber} className="p-2 border-b">
                                    <span className="text-muted-foreground">#{p.pullNumber}</span> {p.title}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Issues ({repoInfo.issues.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                         <ul>
                            {repoInfo.issues.map(i => (
                                <li key={i.issueNumber} className="p-2 border-b">
                                   <span className="text-muted-foreground">#{i.issueNumber}</span> {i.title}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Commits ({repoInfo.commits.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <ul>
                            {repoInfo.commits.map(c => (
                                <li key={c.sha} className="p-2 border-b">
                                    <p className="font-mono text-sm">{c.sha.substring(0, 7)}</p>
                                    <p className="text-sm line-clamp-1">{c.message}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}