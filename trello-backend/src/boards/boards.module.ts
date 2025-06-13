import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { UsersModule } from 'src/user/users.module';

@Module({
  imports: [UsersModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}