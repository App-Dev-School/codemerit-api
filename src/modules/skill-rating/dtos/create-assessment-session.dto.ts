import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { CreateSkillRatingDto } from './create-skill-rating.dto';

export class CreateAssessmentSessionDto {
  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ example: 101 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Initial interview' })
  @IsString()
  assessmentTitle: string;

  @ApiPropertyOptional({ example: 'Initial interview' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    enum: RatingTypeEnum,
    default: RatingTypeEnum.SELF,
    description: 'Type of rating (SELF or QUIZ)',
  })
  @IsEnum(RatingTypeEnum, {
    message: `ratingType must be one of: ${Object.values(RatingTypeEnum).join(', ')}`,
  })
  ratingType: RatingTypeEnum;

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @IsInt()
  ratedBy?: number;
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateSkillRatingDto)
  // skillRatings: CreateSkillRatingDto[];

  @ApiProperty({ type: [CreateSkillRatingDto] })
  @IsArray()
  @Type(() => CreateSkillRatingDto)
  skillRatings: CreateSkillRatingDto[];
}
