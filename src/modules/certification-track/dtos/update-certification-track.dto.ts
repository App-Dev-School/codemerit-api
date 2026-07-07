import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCertificationTrackDto {
  @ApiPropertyOptional({ example: 'Frontend Fundamentals Updated' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
