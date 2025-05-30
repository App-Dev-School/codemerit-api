import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';
import { LavelEnum } from 'src/common/enum/lavel.enum';

export class UpdateQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional()
  @IsInt()
  topicId: number;

  @ApiPropertyOptional()
  @IsInt()
  subjectId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LabelEnum)
  label?: LabelEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LavelEnum)
  level?: LavelEnum;

  @ApiPropertyOptional()
  @IsInt()
  marks: number;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isPublished: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numReads?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numQuizzes?: number;
}
