// src/auth/dto/send-otp.dto.ts
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'Chỉ chấp nhận email Gmail (kết thúc bằng @gmail.com).',
  })
  email: string;
}
