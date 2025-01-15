import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john@gmail.com',
    required: true
 })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John@12',
    required: true
 })
  @IsString()
  password: string;
}