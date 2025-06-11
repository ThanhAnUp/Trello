import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BoardGateway } from 'src/websocket/gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly boardGateway: BoardGateway,
  ) { }

  private getTasksCollection(boardId: string) {
    return this.firebaseService.getFirestore().collection('boards').doc(boardId).collection('tasks');
  }

  async create(boardId: string, createTaskDto: CreateTaskDto) {
    const tasksCollection = this.getTasksCollection(boardId);
    const snapshot = await tasksCollection.where('status', '==', createTaskDto.status).get();
    const order = snapshot.size;
    const newTaskData = {
      ...createTaskDto,
      order,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await this.getTasksCollection(boardId).add(newTaskData);
    const newTask = { id: docRef.id, ...newTaskData };

    this.boardGateway.broadcastTaskUpdate(boardId, 'task_created', newTask);
    return newTask;
  }

  async findAll(boardId: string) {
    const snapshot = await this.getTasksCollection(boardId).orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async update(boardId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const taskRef = this.getTasksCollection(boardId).doc(taskId);
    const cleanUpdateData: { [key: string]: any } = {};
    Object.keys(updateTaskDto).forEach(key => {
      if (updateTaskDto[key] !== undefined) {
        cleanUpdateData[key] = updateTaskDto[key];
      }
    });
    if (Object.keys(cleanUpdateData).length === 0) {
      console.log("Không có trường hợp lệ để cập nhật.");
      return;
    }
    cleanUpdateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await taskRef.update(cleanUpdateData);
    const updatedTask = { id: taskId, ...cleanUpdateData };
    this.boardGateway.broadcastTaskUpdate(boardId, 'task_updated', updatedTask);
    return updatedTask;
  }


  async delete(boardId: string, taskId: string) {
    await this.getTasksCollection(boardId).doc(taskId).delete();
    this.boardGateway.broadcastTaskUpdate(boardId, 'task_deleted', { id: taskId });
  }

  async reorder(boardId: string, orderedTaskIds: string[]): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const batch = firestore.batch();
    orderedTaskIds.forEach((taskId, index) => {
      const taskRef = this.getTasksCollection(boardId).doc(taskId);
      batch.update(taskRef, { order: index });
    });
    await batch.commit();
    this.boardGateway.broadcastTaskUpdate(boardId, 'tasks_reordered', { orderedTaskIds });
  }
}