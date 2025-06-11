import { BoardsGrid } from "@/components/dashboard/boards-grid"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Các bảng của bạn</h1>
          <p className="text-muted-foreground">Quản lý và cộng tác với nhóm của bạn</p>
        </div>
        <BoardsGrid />
      </div>
    </DashboardLayout>
  )
}
