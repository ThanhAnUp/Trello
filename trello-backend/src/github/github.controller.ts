import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { GithubService } from './github.service';

@UseGuards(JwtAuthGuard)
@Controller('repositories')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get(':owner/:repo/github-info')
  getRepositoryInfo(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.githubService.getRepositoryInfo(userId, owner, repo);
  }
}