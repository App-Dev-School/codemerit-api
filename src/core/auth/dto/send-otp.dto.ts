import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';

export class SendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid e-mail' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Tag used to identify the purpose of the OTP',
    enum: UserOtpTagsEnum,
    example: UserOtpTagsEnum.PWD_RECOVER,
  })
  @IsEnum(UserOtpTagsEnum, { message: 'Invalid tag value' })
  @IsNotEmpty({ message: 'tag is required' })
  tag: UserOtpTagsEnum;
}
