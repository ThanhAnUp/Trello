import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { GithubService } from './github.service';

@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/github-info')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get()
  getRepositoryInfo(@Param('boardId') boardId: string) {
    return this.githubService.getRepositoryInfoForBoard(boardId);
  }
}