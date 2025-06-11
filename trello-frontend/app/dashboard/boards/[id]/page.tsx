import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BoardView } from "@/components/board/board-view"

interface BoardPageProps {
  params: {
    id: string
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;

  return (
    <DashboardLayout>
      <BoardView boardId={id} />
    </DashboardLayout>
  )
}