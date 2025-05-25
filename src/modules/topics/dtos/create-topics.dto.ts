import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Title of the topic',
    example: 'Introduction to Algebra',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Subject ID the topic belongs to', example: 3 })
  @IsInt({ message: 'Subject ID must be an integer' })
  subjectId: number;

  @ApiPropertyOptional({ description: 'Optional image URL for the topic' })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @ApiPropertyOptional({
    enum: LabelEnum,
    description: 'Optional label for categorizing the topic',
  })
  @IsOptional()
  @IsEnum(LabelEnum, { message: 'Invalid label value' })
  label?: LabelEnum;

  @ApiPropertyOptional({
    description: 'Color associated with the topic',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @ApiProperty({
    description: 'Slug for the topic (URL-friendly identifier)',
    example: 'intro-to-algebra',
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @ApiProperty({ description: 'Display order of the topic', example: 1 })
  @IsInt({ message: 'Order must be an integer' })
  order: number;

  @ApiPropertyOptional({ description: 'ID of the parent topic (if any)' })
  @IsOptional()
  @IsInt({ message: 'Parent must be an integer' })
  parent?: number;

  @ApiProperty({ description: 'Whether the topic is published', example: true })
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished: boolean;

  @ApiPropertyOptional({ description: 'Short description of the topic' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Learning goal associated with the topic',
  })
  @IsOptional()
  @IsString({ message: 'Goal must be a string' })
  goal?: string;

  @ApiPropertyOptional({ description: 'Number of votes', example: 10 })
  @IsOptional()
  @IsInt({ message: 'numVotes must be an integer' })
  numVotes?: number;

  @ApiPropertyOptional({
    description: 'Number of lessons under this topic',
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'numLessons must be an integer' })
  numLessons?: number;

  @ApiPropertyOptional({
    description: 'Number of questions under this topic',
    example: 8,
  })
  @IsOptional()
  @IsInt({ message: 'numQuestions must be an integer' })
  numQuestions?: number;

  @ApiPropertyOptional({
    description: 'Number of trivia items under this topic',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'numTrivia must be an integer' })
  numTrivia?: number;

  @ApiPropertyOptional({
    description: 'Number of quizzes under this topic',
    example: 4,
  })
  @IsOptional()
  @IsInt({ message: 'numQuizzes must be an integer' })
  numQuizzes?: number;
}
