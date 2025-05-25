import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';

export class AccountVerificationDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'The OTP sent to the user',
    example: '123456',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  otp: string;

  @ApiProperty({
    enum: UserOtpTagsEnum,
    description: 'The OTP tag associated with the user',
    example: UserOtpTagsEnum.PWD_RECOVER,
  })
  @IsEnum(UserOtpTagsEnum, { message: 'Invalid tag value' })
  @IsNotEmpty({ message: 'Tag is required' })
  tag: UserOtpTagsEnum;

  @ApiPropertyOptional({
    description: 'Optional password if required for verification',
    example: 'StrongPass123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;
}
