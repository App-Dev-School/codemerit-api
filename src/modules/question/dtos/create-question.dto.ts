import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { CreateOptionDto } from './create-option.dto';

export class CreateQuestionDto {
  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    description: 'The text of the question',
    example: 'What is the capital of France?',
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiProperty({
    description: 'The text of the question',
    example: 'What is the capital of France?',
  })
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  question: string;

  @ApiProperty({
    description: 'ID of the subject the question belongs to',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Subject ID must be a number' })
  subjectId: number;

  @ApiProperty({
    description: 'Specify question type',
    enum: QuestionTypeEnum,
    example: QuestionTypeEnum.Trivia,
    default: QuestionTypeEnum.General,
  })
  @IsEnum(QuestionTypeEnum, { message: 'Question type should be valid.' })
  questionType: QuestionTypeEnum;

  @ApiProperty({
    description: 'IDs of the topics associated with the question',
    example: [2, 3],
    isArray: true,
    type: Number,
  })
  @IsArray({ message: 'Topic IDs must be an array' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'Each topic ID must be a number' })
  topicIds: number[];

  @ApiProperty({
    description: 'Difficulty level of the question',
    enum: DifficultyLevelEnum,
    example: DifficultyLevelEnum.Easy,
    default: DifficultyLevelEnum.Easy,
  })
  @IsEnum(DifficultyLevelEnum, { message: 'Level must be a valid value' })
  level: DifficultyLevelEnum;

  @ApiPropertyOptional({
    description: 'Order of the question within the quiz or exam',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;

  @ApiProperty({
    description: 'Marks assigned to the question.',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Marks must be a number.' })
  marks: number;

    @ApiProperty({
    description: 'Marks assigned to the question.',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Time allowed in seconds.' })
  timeAllowed: number;

  @ApiPropertyOptional({
    description: 'Publishing status of the question',
    enum: QuestionStatusEnum,
    example: QuestionStatusEnum.Pending,
    default: QuestionStatusEnum.Pending,
  })
  @IsOptional()
  @IsEnum(QuestionStatusEnum, { message: 'Status must be valid.' })
  status: QuestionStatusEnum;

  @ApiPropertyOptional({
    description: 'Optional hint for the question',
    example: 'Think about European capitals.',
  })
  @IsOptional()
  @IsString({ message: 'Hint must be a string' })
  hint?: string;

  @ApiPropertyOptional({
    description: 'Option array associated with the question',
    // example: [10, 11, 12],
    isArray: true,
    type: CreateOptionDto,
  })
  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];
}
