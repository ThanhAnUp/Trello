import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { UsersModule } from 'src/user/users.module';

@Module({
  imports: [UsersModule],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}