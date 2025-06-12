"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { useWebSocket } from "../providers/websocket-provider"
import { Column } from "./column"
import { TaskCard } from "./task-card"
import { CreateTaskDialog } from "./create-task-dialog"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { TaskDetailDialog } from "./task-detail-dialog"
import { BoardItem } from "../dashboard/boards-grid"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { LinkRepoForm } from "./link-repo-form"

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

interface BoardViewProps {
    boardId: string
}

const initialColumns = [
    { id: "icebox", title: "Icebox", color: "bg-gray-100" },
    { id: "backlog", title: "Backlog", color: "bg-blue-100" },
    { id: "ongoing", title: "In Progress", color: "bg-yellow-100" },
    { id: "review", title: "Review", color: "bg-purple-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
]

export function BoardView({ boardId }: BoardViewProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true);
    const [board, setBoard] = useState<BoardItem | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const { socket, isConnected, emitEvent } = useWebSocket()
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showTaskDetail, setShowTaskDetail] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const { toast } = useToast()

    const fetchData = async () => {
        if (!boardId) return;
        try {
            setLoading(true);
            const [boardRes, tasksRes] = await Promise.all([
                api.get(`/boards/${boardId}`),
                api.get(`/boards/${boardId}/tasks`)
            ]);
            setBoard(boardRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu board:", error);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải dữ liệu của board." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!boardId) return;
        fetchData();

        const handleTasksReordered = ({ orderedTaskIds }: { orderedTaskIds: string[] }) => {
            setTasks(currentTasks => {
                const otherTasks = currentTasks.filter(task => !orderedTaskIds.includes(task.id));
                const taskMap = new Map(currentTasks.map(task => [task.id, task]));
                const reorderedTasksInColumn = orderedTaskIds.map(id => taskMap.get(id)).filter(Boolean) as Task[];
                return [...otherTasks, ...reorderedTasksInColumn];
            });
        };

        if (isConnected && socket) {
            emitEvent('join_board', boardId);
            const handleTaskCreated = (newTask: Task) => {
                console.log(newTask, 'newTask')
                setTasks((prev) => [...prev, newTask]);
            };
            const handleTaskUpdated = (updatedTask: Task) => {
                setTasks((prev) =>
                    prev.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task))
                );
            };

            const handleTaskDeleted = ({ id: deletedTaskId }: { id: string }) => {
                setTasks((prevTasks) => prevTasks.filter(task => task.id !== deletedTaskId));
            };

            socket.on('task_created', handleTaskCreated);
            socket.on('task_updated', handleTaskUpdated);
            socket.on('tasks_reordered', handleTasksReordered);
            socket.on('task_deleted', handleTaskDeleted);

            return () => {
                emitEvent('leave_board', boardId);
                socket.off('task_created', handleTaskCreated);
                socket.off('task_updated', handleTaskUpdated);
                socket.off('tasks_reordered', handleTasksReordered);
                socket.off('task_deleted', handleTaskDeleted);
            };
        }
    }, [boardId, isConnected, socket, emitEvent]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id)
        setActiveTask(task || null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            return;
        }
        const activeId = active.id.toString();
        const overId = over.id.toString();
        if (activeId === overId) {
            return;
        }
        const originalTasks = [...tasks];
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        let overIndex = tasks.findIndex((t) => t.id === overId);
        const isOverAColumn = initialColumns.some(col => col.id === overId);
        if (isOverAColumn) {
            const activeTask = tasks[activeIndex];
            if (activeTask.status !== overId) {
                setTasks((prevTasks) => {
                    const newTasks = [...prevTasks];
                    newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId };
                    return newTasks;
                });

                api.patch(`/boards/${boardId}/tasks/${activeId}`, { status: overId })
                    .catch((error) => {
                        console.error("Lỗi khi cập nhật trạng thái task:", error);
                        setTasks(originalTasks);
                        toast({
                            title: 'Lỗi',
                            description: 'Không thể di chuyển task, vui lòng thử lại.',
                            variant: "destructive",
                        })
                    });
            }
            return;
        }

        const isOverATask = overIndex !== -1;
        if (isOverATask) {
            if (tasks[activeIndex].status === tasks[overIndex].status) {
                const reorderedTasks = arrayMove(tasks, activeIndex, overIndex);
                setTasks(reorderedTasks);
                const orderedIdsInColumn = reorderedTasks
                    .filter(t => t.status === tasks[activeIndex].status)
                    .map(t => t.id);
                api.post(`/boards/${boardId}/tasks/reorder`, {
                    orderedTaskIds: orderedIdsInColumn
                }).catch(error => {
                    console.error("Lỗi khi sắp xếp lại task:", error);
                    setTasks(originalTasks);
                    toast({
                        title: 'Lỗi',
                        description: 'Không thể sắp xếp lại task.',
                        variant: "destructive",
                    })
                });
            }
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status)
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Task
                    </Button>
                    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Settings className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cài đặt Board</DialogTitle>
                                <DialogDescription>Quản lý và tích hợp cho board "{board?.name}".</DialogDescription>
                            </DialogHeader>
                            {board && <LinkRepoForm
                                boardId={boardId}
                                currentRepo={board.linkedRepo}
                                onSuccess={() => {
                                    fetchData();
                                    setShowSettingsDialog(false);
                                }}
                            />}
                        </DialogContent>
                    </Dialog>
                </div>

            </div>

            <div className="flex w-full h-full overflow-x-auto p-4">
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 h-full w-full pb-4">
                        <SortableContext items={initialColumns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
                            {initialColumns.map((column) => (
                                <Column
                                    key={column.id}
                                    id={column.id}
                                    title={column.title}
                                    color={column.color}
                                    tasks={getTasksByStatus(column.id)}
                                    onTaskClick={(task) => {
                                        setSelectedTask(task)
                                        setShowTaskDetail(true)
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    <DragOverlay>{activeTask ? <TaskCard task={activeTask} isDragging /> : null}</DragOverlay>
                </DndContext>
            </div>
            <CreateTaskDialog
                boardId={boardId}
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            // onTaskCreated={(task) => setTasks((prev) => [...prev, task])}
            />
            <TaskDetailDialog
                task={selectedTask}
                boardId={boardId}
                open={showTaskDetail}
                onOpenChange={setShowTaskDetail}
            />
        </div>
    )
}
