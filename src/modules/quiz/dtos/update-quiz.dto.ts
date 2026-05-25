import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  ArrayNotEmpty,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import { QuizSettingsDto } from './quiz-settings.dto';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';

export class UpdateQuizDto {
  @ApiPropertyOptional({
    description: 'Title of the quiz',
    example: 'Forms in Angular',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Short description of the quiz',
    example: 'Short description of the quiz',
  })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the quiz',
    example: 'Detailed description of the quiz',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '1,2,3' })
  @IsOptional()
  @IsString()
  subjectIds?: string;

  @ApiPropertyOptional({ example: '100,200' })
  @IsOptional()
  @IsString()
  topicIds?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [2, 4, 5, 6, 7, 8],
    description: 'Array of question IDs to associate with the quiz',
  })
  @IsOptional()
  @IsArray({ message: 'questionIds must be an array of numbers' })
  @ArrayNotEmpty({
    message: 'questionIds must be a non-empty array',
  })
  @Type(() => Number)
  @IsInt({
    each: true,
    message: 'questionIds must contain only integer numbers',
  })
  questionIds?: number[];

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  numQuestions?: number;

  @ApiPropertyOptional({
    enum: TopicLabelEnum,
    example: TopicLabelEnum.Foundation,
  })
  @IsOptional()
  @IsEnum(TopicLabelEnum)
  label?: TopicLabelEnum;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'Achieve 80% accuracy' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({
    description: 'Quiz settings',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizSettingsDto)
  settings?: QuizSettingsDto;

  @ApiPropertyOptional({
    enum: DifficultyLevelEnum,
    example: DifficultyLevelEnum.Easy,
    description: 'Difficulty level of the quiz',
  })
  @IsOptional()
  @IsEnum(DifficultyLevelEnum)
  difficulty?: DifficultyLevelEnum;
}
