import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  email: string;
}
