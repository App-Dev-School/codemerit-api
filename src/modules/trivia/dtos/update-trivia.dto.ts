
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevelEnum } from 'src/common/enum/lavel.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateTriviaDto {
  @ApiPropertyOptional({
    description: 'The text of the question',
    example: 'What is the capital of France?',
  })
  @IsOptional()
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  question?: string;

  @ApiPropertyOptional({
    description: 'ID of the subject the question belongs to',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Subject ID must be a number' })
  subjectId?: number;

  @ApiPropertyOptional({
    description: 'IDs of the topics associated with the question',
    example: [2, 3],
    isArray: true,
    type: Number,
  })
  @IsOptional()
  @IsArray({ message: 'Topic IDs must be an array' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'Each topic ID must be a number' })
  topicIds?: number[];

  @ApiPropertyOptional({
    description: 'Difficulty level of the question',
    enum: DifficultyLevelEnum,
    example: DifficultyLevelEnum.Easy,
  })
  @IsOptional()
  @IsEnum(DifficultyLevelEnum, { message: 'Level must be a valid enum value' })
  level?: DifficultyLevelEnum;

  @ApiPropertyOptional({
    description: 'Order of the question within the quiz or exam',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Order must be a number' })
  order?: number;

  @ApiPropertyOptional({
    description: 'Marks assigned to the question',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Marks must be a number' })
  marks?: number;

  @ApiPropertyOptional({
    description: 'Publication status of the question',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Optional hint for the question',
    example: 'Think about European capitals.',
  })
  @IsOptional()
  @IsString({ message: 'Hint must be a string' })
  hint?: string;

  @ApiPropertyOptional({
    description: 'Option IDs associated with the question',
    example: [10, 11, 12],
    isArray: true,
    type: Number,
  })
  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'Each option ID must be a number' })
  options?: number[];
}