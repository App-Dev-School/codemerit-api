import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetRequestableDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isRequestable: boolean;
}
