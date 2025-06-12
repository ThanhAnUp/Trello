import { IsNotEmpty, IsString } from "class-validator";

export class LinkRepoDto {
    @IsString() @IsNotEmpty() owner: string;
    @IsString() @IsNotEmpty() repo: string;
}