import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/users.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter;
    private otpTTL: number;
    private readonly firestore: admin.firestore.Firestore;

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.firestore = this.firebaseService.getFirestore();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_APP_PASS'),
            },
        });
        const otpTTLValue = this.configService.get<number>('OTP_TTL');
        this.otpTTL = otpTTLValue !== undefined ? +otpTTLValue : 300;
    }

    async sendOtp(email: string): Promise<void> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.otpTTL * 1000);
        const mailHtml = this.buildOtpHtmlTemplate(code);

        const otpData = {
            email,
            code,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            used: false,
        };

        let docRefId: string | undefined;

        try {
            const docRef = await this.firestore.collection('otp_codes').add(otpData);
            docRefId = docRef.id;
        } catch (err) {
            console.error('Lỗi khi lưu OTP vào Firestore:', err);
            throw new InternalServerErrorException('Lỗi khi lưu OTP vào DB.');
        }

        const mailOptions = {
            from: `"Trello" <${this.configService.get<string>('SMTP_USER')}>`,
            to: email,
            subject: 'Mã xác thực (OTP)',
            text: `Mã OTP của bạn là: ${code}\nHết hạn sau ${this.otpTTL / 60} phút.`,
            html: mailHtml,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            if (docRefId) {
                await this.firestore.collection('otp_codes').doc(docRefId).delete();
            }
            console.error('Lỗi khi gửi mail OTP:', err);
            throw new InternalServerErrorException('Gửi mail OTP thất bại.');
        }
    }

    async verifyOtp(email: string, code: string): Promise<boolean> {
        const otpQuery = this.firestore
            .collection('otp_codes')
            .where('email', '==', email)
            .where('code', '==', code)
            .where('used', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(1);

        const snapshot = await otpQuery.get();
        if (snapshot.empty) {
            return false;
        }
        const otpDoc = snapshot.docs[0];
        const otpData = otpDoc.data();
        if (otpData.expiresAt.toDate() < new Date()) {
            return false;
        }
        await otpDoc.ref.update({ used: true });
        return true;
    }

    private async getGithubToken(code: string): Promise<string> {
        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
                client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
                code,
            },
            {
                headers: { Accept: 'application/json' },
            },
        );

        if (response.data.error || !response.data.access_token) {
            throw new UnauthorizedException(
                response.data.error_description || 'Không lấy được mã thông báo truy cập GitHub.',
            );
        }
        return response.data.access_token;
    }

    private async getGithubUser(accessToken: string): Promise<any> {
        try {
            const response = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            throw new UnauthorizedException('Không thể lấy thông tin người dùng từ GitHub.');
        }
    }

    async loginWithGithub(code: string): Promise<{ access_token: string; user: any }> {
        const githubToken = await this.getGithubToken(code);
        const githubUser = await this.getGithubUser(githubToken);

        const githubIdString = githubUser.id.toString();
        let user = await this.usersService.findByGithubId(githubIdString);

        const userUpdateData = {
            githubId: githubIdString,
            email: githubUser.email,
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            githubAccessToken: githubToken
        };

        if (user) {
            await this.usersService.update(user.id, userUpdateData);
            user = { ...user, ...userUpdateData };
        } else {
            user = await this.usersService.create(userUpdateData);
        }

        const { access_token } = await this.login(user);
        if (user.password) {
            delete user.password;
        }
        return { access_token, user };
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(user: any) {
        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
            throw new UnauthorizedException('Người dùng đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await this.usersService.create({ ...user, password: hashedPassword });
        await this.login(newUser);
        return newUser
    }

    async verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Token không hợp lệ');
        }
    }

    async getUserFromToken(token: string) {
        const decoded = await this.verifyToken(token);
        const user = await this.usersService.findByEmail(decoded.email);
        if (!user) {
            return null;
        }
        if ('password' in user) {
            delete (user as { password?: string }).password;
        }
        return user;
    }

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    }

    private buildOtpHtmlTemplate(code: string): string {
        const minutes = Math.floor(this.otpTTL / 60);
        return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Mã xác thực (OTP)</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f5f5f5;">
        <table width="100%" bgcolor="#f5f5f5" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;">
          <tr>
            <td align="center">
              <!-- Container chính -->
              <table width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="margin:20px auto; border-radius:8px; overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td align="center" style="background-color: #1976d2; padding:20px 0;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px;">Xem Nhà Bán</h1>
                  </td>
                </tr>

                <!-- Nội dung chính -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="font-size:16px; color:#333333; margin:0 0 16px;">
                      Chào bạn,
                    </p>
                    <p style="font-size:16px; color:#333333; margin:0 0 24px;">
                      Đây là mã xác thực (OTP) của bạn:
                    </p>

                    <!-- Mã OTP -->
                    <div style="background-color:#e3f2fd; border:1px solid #90caf9; padding:16px; border-radius:4px; text-align:center; margin-bottom:24px;">
                      <span style="font-size:32px; letter-spacing:4px; color:#1976d2; font-weight:bold;">${code}</span>
                    </div>

                    <p style="font-size:14px; color:#555555; margin:0 0 8px;">
                      <strong>Mã có hiệu lực trong:</strong> ${minutes} phút
                    </p>
                    <p style="font-size:14px; color:#555555; margin:0 0 24px;">
                      Vui lòng không chia sẻ mã này cho bất kỳ ai.
                    </p>

                    <p style="font-size:14px; color:#555555; margin:0;">
                      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color:#f5f5f5; padding:16px; font-size:12px; color:#999999;">
                    © 2025 Xem Nhà Bán. Mọi quyền được bảo lưu.<br/>
                    123 Đường ABC, Quận XYZ, TP. HCM
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    }
}