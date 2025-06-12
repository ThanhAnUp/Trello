import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class GithubService {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService
  ) {}

  private async getOwnerOctokit(boardId: string): Promise<{octokit: Octokit, owner: string, repo: string}> {
    const boardDoc = await this.firebaseService.getFirestore().collection('boards').doc(boardId).get();
    if (!boardDoc.exists) {
        throw new NotFoundException('Board không tồn tại.');
    }
    const boardData = boardDoc.data();
    if (!boardData || !boardData.ownerId || !boardData.linkedRepo) {
        throw new NotFoundException('Bảng không được liên kết với kho lưu trữ hoặc không có chủ sở hữu.');
    }

    const ownerUser = await this.usersService.findById(boardData.ownerId);
    if (!ownerUser || !ownerUser.githubAccessToken) {
      throw new UnauthorizedException('Chủ sở hữu diễn đàn chưa được xác thực với GitHub hoặc thiếu mã thông báo.');
    }

    const octokit = new Octokit({ auth: ownerUser.githubAccessToken });
    
    return {
        octokit,
        owner: boardData.linkedRepo.owner,
        repo: boardData.linkedRepo.repo
    };
  }


  private async getAuthenticatedOctokit(userId: string): Promise<Octokit> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new UnauthorizedException('Người dùng chưa được xác thực với GitHub hoặc thiếu mã thông báo.');
    }
    return new Octokit({ auth: user.githubAccessToken });
  }

  async getRepositoryInfoForBoard(boardId: string) {
    const { octokit, owner, repo } = await this.getOwnerOctokit(boardId);
    
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