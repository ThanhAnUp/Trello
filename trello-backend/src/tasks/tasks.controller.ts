import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { ReorderTasksDto } from './dto/reorder.dto';
import { AttachGitHubDto } from '../github/dto/github.dto';

@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Param('boardId') boardId: string, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(boardId, createTaskDto);
    }

    @Get()
    findAll(@Param('boardId') boardId: string) {
        return this.tasksService.findAll(boardId);
    }

    @Patch(':taskId')
    update(
        @Param('boardId') boardId: string,
        @Param('taskId') taskId: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.update(boardId, taskId, updateTaskDto);
    }

    @Delete(':taskId')
    delete(@Param('boardId') boardId: string, @Param('taskId') taskId: string) {
        return this.tasksService.delete(boardId, taskId);
    }

    @Post('reorder')
    reorder(
        @Param('boardId') boardId: string,
        @Body() reorderTasksDto: ReorderTasksDto
    ) {
        return this.tasksService.reorder(boardId, reorderTasksDto.orderedTaskIds);
    }

    @Post(':taskId/github-attach')
    addAttachment(
        @Param('boardId') boardId: string,
        @Param('taskId') taskId: string,
        @Body() attachDto: AttachGitHubDto,
    ) {
        const attachmentData = {
            type: attachDto.type,
            ...(attachDto.type === 'commit' ? { sha: attachDto.ref } : { number: attachDto.ref })
        };
        return this.tasksService.addAttachment(boardId, taskId, attachmentData);
    }

    @Get(':taskId/github-attachments')
    getAttachments(
        @Param('boardId') boardId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.tasksService.getAttachments(boardId, taskId);
    }

    @Delete(':taskId/github-attachments/:attachmentId')
    removeAttachment(
        @Param('boardId') boardId: string,
        @Param('taskId') taskId: string,
        @Param('attachmentId') attachmentId: string,
    ) {
        return this.tasksService.removeAttachment(boardId, taskId, attachmentId);
    }
}