import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class GithubService {
  constructor(private readonly usersService: UsersService) {}

  private async getAuthenticatedOctokit(userId: string): Promise<Octokit> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new UnauthorizedException('Người dùng chưa được xác thực với GitHub hoặc thiếu mã thông báo.');
    }
    return new Octokit({ auth: user.githubAccessToken });
  }

  async getRepositoryInfo(userId: string, owner: string, repo: string) {
    const octokit = await this.getAuthenticatedOctokit(userId);
    const [branches, pulls, issues, commits] = await Promise.all([
      octokit.repos.listBranches({ owner, repo }),
      octokit.pulls.list({ owner, repo }),
      octokit.issues.listForRepo({ owner, repo }),
      octokit.repos.listCommits({ owner, repo }),
    ]);

    return {
      repositoryId: `${owner}/${repo}`,
      branches: branches.data.map(b => ({ name: b.name, lastCommitSha: b.commit.sha })),
      pulls: pulls.data.map(p => ({ title: p.title, pullNumber: p.number })),
      issues: issues.data.filter(i => !i.pull_request).map(i => ({ title: i.title, issueNumber: i.number })),
      commits: commits.data.map(c => ({ sha: c.sha, message: c.commit.message })),
    };
  }
}