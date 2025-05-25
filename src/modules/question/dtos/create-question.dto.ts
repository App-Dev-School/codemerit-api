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
  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
  })
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  question: string;

  @ApiProperty({
    description: 'ID of the associated topic',
    example: 1,
  })
  @IsInt({ message: 'Topic ID must be an integer' })
  topicId: number;

  @ApiProperty({
    description: 'ID of the associated subject',
    example: 2,
  })
  @IsInt({ message: 'Subject ID must be an integer' })
  subjectId: number;

  @ApiPropertyOptional({
    description: 'Optional image URL related to the question',
    example: 'https://example.com/image.png',
  })
  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;

  @ApiPropertyOptional({
    enum: LabelEnum,
    description: 'Optional label/category for the question',
  })
  @IsOptional()
  @IsEnum(LabelEnum, { message: 'Invalid label value' })
  label?: LabelEnum;

  @ApiPropertyOptional({
    description: 'Tag associated with the question',
    example: 'geography',
  })
  @IsOptional()
  @IsString({ message: 'Tag must be a string' })
  tag?: string;

  @ApiPropertyOptional({
    enum: LavelEnum, // Consider renaming to LevelEnum for clarity
    description: 'Difficulty level of the question',
  })
  @IsOptional()
  @IsEnum(LavelEnum, { message: 'Invalid level value' })
  level?: LavelEnum;

  @ApiProperty({
    description: 'Marks assigned to the question',
    example: 5,
  })
  @IsInt({ message: 'Marks must be an integer' })
  marks: number;

  @ApiProperty({
    description: 'Unique slug identifier for the question',
    example: 'capital-of-france',
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @ApiProperty({
    description: 'Whether the question is published',
    example: true,
  })
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished: boolean;

  @ApiPropertyOptional({
    description: 'Optional answer to the question',
    example: 'Paris',
  })
  @IsOptional()
  @IsString({ message: 'Answer must be a string' })
  answer?: string;

  @ApiPropertyOptional({
    description: 'Optional hint for solving the question',
    example: 'It is a famous European city.',
  })
  @IsOptional()
  @IsString({ message: 'Hint must be a string' })
  hint?: string;

  @ApiPropertyOptional({
    description: 'Number of times the question has been read',
    example: 12,
  })
  @IsOptional()
  @IsInt({ message: 'numReads must be an integer' })
  numReads?: number;

  @ApiPropertyOptional({
    description: 'Number of quizzes this question appears in',
    example: 3,
  })
  @IsOptional()
  @IsInt({ message: 'numQuizzes must be an integer' })
  numQuizzes?: number;
}
