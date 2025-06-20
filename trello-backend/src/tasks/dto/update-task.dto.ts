import { IsOptional, IsString } from 'class-validator';
export class UpdateTaskDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() assigneeId?: string;
  @IsString() @IsOptional() priority?: string;
  @IsString() @IsOptional() dueDate?: string;
}