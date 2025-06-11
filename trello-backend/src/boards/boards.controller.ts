import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt/jwt.auth.guard";
import { BoardsService } from "./boards.service";
import { CreateBoardDto } from "./dto/create-board.dto";

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
    constructor(private readonly boardsService: BoardsService) { }

    @Post()
    create(@Body() dto: CreateBoardDto, @Req() req) {
        const ownerId = req.user.id;
        return this.boardsService.create(dto, ownerId);
    }

    @Get()
    findAllForUser(@Req() req) {
        const userId = req.user.id;
        return this.boardsService.findAllForUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        const userId = req.user.id;
        return this.boardsService.findOne(id, userId);
    }

    @Post(':id/join')
    joinBoard(@Param('id') id: string, @Req() req) {
        const userId = req.user.id;
        return this.boardsService.addMember(id, userId);
    }
}