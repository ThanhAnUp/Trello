import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  broadcastTaskUpdate(cardId: string, task: any) {
    this.server.to(cardId).emit('task_updated', task);
  }

  joinCardRoom(client: any, cardId: string) {
    client.join(cardId);
  }

  leaveCardRoom(client: any, cardId: string) {
    client.leave(cardId);
  }
}