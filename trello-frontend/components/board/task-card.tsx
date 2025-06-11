"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertCircle, User, GripVertical } from "lucide-react"

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

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onClick?: () => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export function TaskCard({ task, isDragging = false, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const isOverdue = new Date(task.dueDate) < new Date()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2 pr-2">{task.title}</CardTitle>
          <div className="flex items-center space-x-2">
              <Badge className={priorityColors[task.priority]} variant="secondary">
                {task.priority}
              </Badge>
              <div
                {...listeners}
                className="p-1 cursor-grab active:cursor-grabbing touch-none"
                onClick={(e) => {
                    e.stopPropagation();
                }}
              >
                  <GripVertical className="h-5 w-5 text-gray-500" />
              </div>
          </div>
        </div>
        <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User/>
            <span className="text-xs text-gray-600">{task.assigneeId}</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
            {isOverdue && <AlertCircle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
