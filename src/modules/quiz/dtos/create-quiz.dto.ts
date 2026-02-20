import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import { QuizSettingsDto } from './quiz-settings.dto';

export class CreateQuizDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    description: 'Title of the topic',
    example: 'Forms in Angular',
  })
  @ValidateIf((o) => o.quizType === QuizTypeEnum.Standard)
  @IsString()
  @IsNotEmpty({ message: 'Title is required ' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Short description of the quiz',
    example: 'Short description of the quiz',
  })
  @ValidateIf((o) => o.quizType === QuizTypeEnum.Standard)
  @IsString()
  @IsNotEmpty({ message: 'Short description is required ' })
  shortDesc?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the quiz',
    example: 'Detailed description of the quiz',
  })
  @ValidateIf((o) => o.quizType === QuizTypeEnum.Standard)
  @IsString()
  @IsNotEmpty({ message: 'Description is required ' })
  description: string;

  @ApiPropertyOptional({ example: '1, 2' })
  @ValidateIf((o) => !o.topicIds)
  @IsString()
  @IsNotEmpty({ message: 'Either subjectIds or topicIds is required' })
  subjectIds?: string;

  @ApiPropertyOptional({ example: '100, 200' })
  @ValidateIf((o) => !o.subjectIds)
  @IsString()
  @IsNotEmpty({ message: 'Either subjectIds or topicIds is required' })
  topicIds?: string;

  @ApiProperty({
    enum: QuizTypeEnum,
    example: QuizTypeEnum.UserQuiz,
    description: 'Type of quiz',
  })
  @IsEnum(QuizTypeEnum)
  quizType: QuizTypeEnum; // user will create as UserQuiz

  @ApiPropertyOptional({ example: '5, 10' })
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

  @ApiPropertyOptional({ example: '5, 6, 7' })
  @ValidateIf((o) => o.quizType === QuizTypeEnum.Standard)
  @IsString()
  @IsNotEmpty({ message: 'questionIds is required ' })
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

  @ApiPropertyOptional({
    description: 'Quiz settings (only for Standard quiz)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizSettingsDto)
  settings?: QuizSettingsDto;
}
