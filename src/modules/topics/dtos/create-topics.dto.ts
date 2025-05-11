import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';

export class CreateTopicDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsInt()
  subjectId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  label?: LabelEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsInt()
  order: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parent?: number;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numVotes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numLessons: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numQuestions: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numTrivia: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numQuizzes: number;
}
