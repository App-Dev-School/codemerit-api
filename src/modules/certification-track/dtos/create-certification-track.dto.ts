import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCertificationTrackDto {
  @ApiProperty({ description: 'ID of the job role this certification track belongs to', example: 1 })
  @IsInt()
  jobRoleId: number;

  @ApiProperty({ description: 'Title of the certification track', example: 'Frontend Fundamentals' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description of what this track covers', example: 'Core JavaScript and TypeScript skills for frontend roles.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order within the job role', example: 1 })
  @IsInt()
  @Min(1)
  sortOrder: number;

  @ApiProperty({ description: 'Whether this track is visible to learners', example: true })
  @IsBoolean()
  isPublished: boolean;
}
