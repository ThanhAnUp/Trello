import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class AttachGitHubDto {
    @IsIn(['pull_request', 'commit', 'issue'])
    type: 'pull_request' | 'commit' | 'issue';
    
    @IsString()
    @IsNotEmpty()
    ref: string; 
}