import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';

export class UpdateTopicDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  subjectId?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

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
  numVotes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numLessons?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numQuestions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numTrivia?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numQuizzes?: number;
}
