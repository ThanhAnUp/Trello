import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_board')
  handleJoinBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(boardId);
    client.emit('joined_board', `Bạn đã tham gia vào bảng ${boardId}`);
  }

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  broadcastTaskUpdate(boardId: string, event: string, data: any) {
    this.server.to(boardId).emit(event, data);
  }

  @SubscribeMessage('leave_board')
  handleLeaveBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(boardId);
    client.emit('left_board', `Bạn đã rời bảng ${boardId}`);
  }

}