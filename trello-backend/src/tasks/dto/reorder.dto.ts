import { IsArray, IsString } from "class-validator";

export class ReorderTasksDto {
    @IsArray()
    @IsString({ each: true })
    orderedTaskIds: string[];
}