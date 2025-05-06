import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';

export class AccountVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  otp: number;

  @ApiProperty({
    enum: UserOtpTagsEnum,
    description: 'The OTP tag associated with the user',
  })
  @ApiProperty()
  @IsEnum(UserOtpTagsEnum)
  @IsNotEmpty()
  tag: UserOtpTagsEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
