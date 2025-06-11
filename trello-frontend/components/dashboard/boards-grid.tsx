"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar } from "lucide-react"
import { Badge } from "../ui/badge"
import { CreateBoardDialog } from "./create-board-dialog"
import { api } from "@/lib/api"
import dayjs from 'dayjs'

export type BoardItem = {
  id: string,
  name: string,
  description: string,
  ownerId: string,
  memberIds: string[],
  createdAt: any
}

export function BoardsGrid() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [boards, setBoards] = useState<BoardItem[]>([])

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                 <div className="flex items-start justify-end">
                  <Badge variant="secondary" className="bg-green-500 text-white">Open</Badge>
                </div>
                <CardTitle className="text-lg">{board.name}</CardTitle>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {board.memberIds.length} members
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {dayjs(board.createdAt || new Date()).format('DD/MM/YYYY')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <CreateBoardDialog open={showCreateDialog} onOpenChange={(value) => {
        if(value === false){
          fetchBoards()
        }
        setShowCreateDialog(value)
      }} />
    </>
  )
}
