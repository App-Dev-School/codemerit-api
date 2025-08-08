import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevelEnum } from 'src/common/enum/lavel.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionStatus } from 'src/common/enum/questionStatus.enum';
import { QuestionType } from 'src/common/enum/questionType';


export class CreateTriviaDto {
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
    enum: QuestionType,
    example: QuestionType.Trivia,
    default: QuestionType.General
  })
  @IsEnum(QuestionType, { message: 'Question type should be valid.' })
    questionType: QuestionType;

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
    default: DifficultyLevelEnum.Easy
  })
  @IsEnum(DifficultyLevelEnum, { message: 'Level must be a valid value' })
  level: DifficultyLevelEnum;

  @ApiProperty({
    description: 'Order of the question within the quiz or exam',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;

  @ApiProperty({
    description: 'Marks assigned to the question.',
    example: 5,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Marks must be a number.' })
  marks: number;

   @ApiProperty({
    description: 'Publishing status of the question',
    enum: QuestionStatus,
    example: QuestionStatus.Pending,
    default: QuestionStatus.Pending
  })
  @IsEnum(QuestionStatus, { message: 'Status must be valid.' })
  status: QuestionStatus;

  @ApiPropertyOptional({
    description: 'Optional hint for the question',
    example: 'Think about European capitals.',
  })
  @IsOptional()
  @IsString({ message: 'Hint must be a string' })
  hint?: string;

  @ApiProperty({
    description: 'Option IDs associated with the question',
    example: [10, 11, 12],
    isArray: true,
    type: Number,
  })
  @IsArray({ message: 'Options must be an array' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'Each option ID must be a number' })
  options: number[];
}
