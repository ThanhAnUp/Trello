import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { BoardGateway } from 'src/websocket/gateway';

@Module({
  controllers: [TasksController],
  providers: [TasksService, BoardGateway],
})
export class TasksModule {}