import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsNotEmpty()
    assigneeId: string;

    @IsString()
    @IsNotEmpty()
    priority: string;

    @IsString()
    @IsNotEmpty()
    dueDate: string;
}