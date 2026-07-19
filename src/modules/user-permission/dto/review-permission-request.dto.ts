import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewPermissionRequestDto {
  @ApiPropertyOptional({ example: 'Approved for the duration of the hiring drive.' })
  @IsOptional()
  @IsString()
  reviewComment?: string;
}
