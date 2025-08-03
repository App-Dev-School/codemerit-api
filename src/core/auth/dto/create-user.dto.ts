import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsMobilePhone, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Ralph',
  })
  @IsNotEmpty({ message: 'First name must not be empty' })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Tolle',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'ralph@appdev.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsOptional()
  // @IsMobilePhone("en-US", { strictMode: false })
  mobile?: string;

  @IsNotEmpty({ message: 'Please select your current status.' })
  designation: string;

  @IsNotEmpty({ message: 'Please let us know your city.' })
  city: string;
}