import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBoardDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description?: string
}