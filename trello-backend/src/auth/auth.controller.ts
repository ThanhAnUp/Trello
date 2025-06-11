import { Controller, Post, Body, UseGuards, Get, Res, Req, ValidationPipe, BadRequestException, Query } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/user/users.service';
import { JwtAuthGuard } from './jwt/jwt.auth.guard';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) { }

    @Post('register')
    async register(@Res({ passthrough: true }) res: Response, @Body() dto: any) {
        const user = await this.authService.register(dto);
        const { access_token } = await this.authService.login(user);
        res.cookie('AUTH_TOKEN', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/',
        });
        const { email, id, name } = user;
        return { success: true, user: { email, id, name } }
    }

    @Get('github')
    githubLogin(@Res() res: Response) {
        const clientID = process.env.GITHUB_CLIENT_ID;
        const callbackURL = process.env.GITHUB_CALLBACK_URL;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${callbackURL}&scope=user:email`;
        res.redirect(githubAuthUrl);
    }

    @Get('github/callback')
    async githubCallback(
        @Query('code') code: string,
        @Res() res: Response,
    ) {
        if (!code) {
            return { success: false, user: null };
        }
        try {
            const { access_token, user } = await this.authService.loginWithGithub(code);
            res.cookie('AUTH_TOKEN', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'lax',
                path: '/',
            });
            return { success: true, user };

        } catch (error) {
            return { success: false, user: null };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getCurrentUser(@Req() req) {
        return { user: req.user };
    }

    @Post('login')
    async login(@Res({ passthrough: true }) res: Response, @Body() creds: LoginDto) {
        const user = await this.authService.validateUser(creds.email, creds.password);
        const { access_token } = await this.authService.login(user);
        res.cookie('AUTH_TOKEN', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/',
        });
        return { success: true, user };
    }

    @Post('send-otp')
    async sendOtp(
        @Body(new ValidationPipe({ whitelist: true, transform: true }))
        dto: SendOtpDto,
    ) {
        await this.authService.sendOtp(dto.email);
        return {
            success: true,
            message: 'Mã OTP đã được gửi vào hộp thư Gmail của bạn.',
        };
    }

    @Post('verify-otp')
    async verifyOtp(
        @Res({ passthrough: true }) res: Response,
        @Body(new ValidationPipe({ whitelist: true, transform: true }))
        dto: any,
    ) {
        const isValid = await this.authService.verifyOtp(dto.email, dto.code);
        if (!isValid) {
            throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        let user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            const createdUsers = await this.usersService.create({
                email: dto.email,
                password: dto.password,
                name: dto.name,
            });
            user = Array.isArray(createdUsers) ? createdUsers[0] : createdUsers;
        }
        const { access_token } = await this.authService.login(user);
        res.cookie('AUTH_TOKEN', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/',
        });
        return {
            success: true,
            message: 'Xác thực OTP thành công.',
            user: user,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('AUTH_TOKEN', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return { success: true };
    }

    @Post('verify')
    async verify(@Body() body: { token: string }) {
        return this.authService.verifyToken(body.token);
    }
}