import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';

export class CreateQuizDto {

  // @ApiProperty()
  // @IsNumber()
  // userId: number;

  @ApiPropertyOptional({
    description: 'Title of the topic',
    example: 'Forms in Angular',
  })
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Short description of the quiz' })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiPropertyOptional({ example: 'Detailed description of the quiz' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '1, 2' })
  @IsOptional()
  @IsString()
  subjectIds?: string;

  @ApiPropertyOptional({ example: '10, 20' })
  @IsOptional()
  @IsString()
  jobIds?: string;

  @ApiPropertyOptional({ example: '100, 200' })
  @IsOptional()
  @IsString()
  topicIds?: string;

  @ApiProperty({ enum: QuizTypeEnum, example: QuizTypeEnum.UserQuiz, description: 'Type of quiz' })
  @IsEnum(QuizTypeEnum)
  quizType: QuizTypeEnum; // user will create as UserQuiz

  @ApiPropertyOptional({ enum: TopicLabelEnum, example: TopicLabelEnum.Foundation })
  @IsOptional()
  @IsEnum(TopicLabelEnum)
  label?: TopicLabelEnum;

  @ApiPropertyOptional({ example: '5, 6, 7' })
  @IsOptional()
  @IsString()
  questionIds?: string; // admin will provide

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'Achieve 80% accuracy' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ example: 'angular,forms' })
  @IsOptional()
  @IsString()
  tag?: string;
}