import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class RequestPermissionDto {
  @ApiProperty({ example: 8 })
  @IsInt()
  @IsNumber()
  permissionId: number;

  @ApiProperty({
    example: 'Need this to review job-role questions for the new hiring drive.',
    description: 'Why the permission is needed — shown to the reviewer.',
  })
  @IsString()
  @MinLength(5, { message: 'Please include a short reason (at least 5 characters).' })
  comment: string;

  @ApiPropertyOptional({ example: 'subject' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @IsNumber()
  resourceId?: number;
}
