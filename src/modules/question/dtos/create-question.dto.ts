import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';
import { LavelEnum } from 'src/common/enum/lavel.enum';

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsInt()
  topicId: number;

  @ApiProperty()
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

  @ApiProperty()
  @IsInt()
  marks: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
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
