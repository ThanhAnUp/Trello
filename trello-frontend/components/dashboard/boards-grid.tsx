"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar, Trash, LogIn, Copy } from "lucide-react"
import { Badge } from "../ui/badge"
import { CreateBoardDialog } from "./create-board-dialog"
import { api } from "@/lib/api"
import dayjs from 'dayjs'
import { Button } from "../ui/button"
import { useUserStore } from "@/store/user-store"
import { useRouter } from "next/navigation"
import { JoinBoardDialog } from "../board/join-board-dialog"
import { useToast } from "@/hooks/use-toast"

export type BoardItem = {
  id: string,
  name: string,
  linkedRepo?: { owner: string; repo: string };
  description: string,
  ownerId: string,
  memberIds: string[],
  createdAt: any
}

export function BoardsGrid() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [boards, setBoards] = useState<BoardItem[]>([])
  const { user } = useUserStore()
  const router = useRouter();
  const { toast } = useToast();

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards')
      setBoards(res.data || [])
    } catch (err) {

    }
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  const handleCopyBoardId = (event: React.MouseEvent<HTMLButtonElement>, boardId: string) => {
    event.stopPropagation();
    event.preventDefault();
    navigator.clipboard.writeText(boardId).then(() => {
      toast({
        title: "Đã sao chép!",
        description: "ID của board đã được sao chép vào clipboard.",
      });
    }).catch(err => {
      console.error('Không thể sao chép ID:', err);
      toast({
        title: "Lỗi",
        description: "Không thể sao chép ID. Vui lòng thử lại.",
        variant: "destructive",
      });
    });
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleJoinSuccess = (joinedBoardId: string) => {
    fetchBoards();
    router.push(`/dashboard/boards/${joinedBoardId}`);
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
          <LogIn className="h-4 w-4 mr-2" />
          Tham gia Board
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          className="border-dashed border-2 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo công việc mới</h3>
            <p className="text-sm text-gray-500">Bắt đầu một dự án mới và mời nhóm của bạn</p>
          </CardContent>
        </Card>
        {boards.map((board) => (
          <Link key={board.id} href={`/dashboard/boards/${board.id}`} className="min-h-full">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer min-h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-green-500 text-white">Open</Badge>
                  {board.ownerId === user?.id && <Button variant='destructive' onClick={(event) => handleDeleteClick(event, board.id)}>
                    <Trash />
                    Xóa
                  </Button>}
                </div>
                <CardTitle className="text-lg">{board.name}</CardTitle>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {board.memberIds.length} thành viên
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {dayjs(board.createdAt._seconds * 1000 || new Date()).format('HH:mm DD/MM/YYYY')}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(event) => handleCopyBoardId(event, board.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép ID
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <CreateBoardDialog open={showCreateDialog} onOpenChange={(value) => {
        if (value === false) {
          fetchBoards()
        }
        setShowCreateDialog(value)
      }} />
      <JoinBoardDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onSuccess={handleJoinSuccess}
      />
    </>
  )
}
