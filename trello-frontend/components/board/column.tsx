"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"

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

interface ColumnProps {
  id: string
  title: string
  color: string
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

export function Column({ id, title, color, tasks, onTaskClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <Card className={`w-80 flex-shrink-0 max-h-screen overflow-y-auto ${isOver ? "ring-2 ring-blue-500" : ""}`}>
      <CardHeader className={`${color} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 min-h-[400px]" ref={setNodeRef}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Không có task</p>
            <p className="text-sm">Kéo thả hoặc tạo mới</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
