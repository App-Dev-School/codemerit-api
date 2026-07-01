import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';

export class CreateLessonDto {
  @ApiProperty({ example: 'JavaScript Hicks' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subject?: number;

  @ApiProperty({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  topic?: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  topicId?: number;

  @ApiProperty({
    enum: DifficultyLevelEnum,
    example: DifficultyLevelEnum.Easy,
  })
  @IsEnum(DifficultyLevelEnum)
  level: DifficultyLevelEnum;

  @ApiProperty({
    type: [String],
    example: ['<p>Description 1</p>', '<p>Description 2</p>'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  descriptions: string[];
}
