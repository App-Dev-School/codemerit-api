import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectTrackDto {
  @ApiProperty({ description: 'ID of the subject this track belongs to', example: 1 })
  @IsInt()
  subjectId: number;

  @ApiProperty({ description: 'Title of the subject track', example: 'JS Foundations' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Short description of this track', example: 'Core JavaScript concepts every developer must know.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order within the subject', example: 1 })
  @IsInt()
  @Min(1)
  sortOrder: number;

  @ApiProperty({ description: 'Whether this track is visible to learners', example: true })
  @IsBoolean()
  isPublished: boolean;
}
