import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';

export class CreateSkillRatingDto {
  @ApiPropertyOptional({ example: 101 })
  @IsInt()
  id?: number;

  @ApiProperty({
    enum: SkillTypeEnum,
    default: SkillTypeEnum.SUBJECT,
    description: 'Type of the skill',
  })
  @IsEnum(SkillTypeEnum, {
    message: `skill Type must be one of: ${Object.values(SkillTypeEnum).join(', ')}`,
  })
  skillType: SkillTypeEnum;

  @ApiProperty({ example: 200 })
  @IsInt()
  skillId: number;

  @ApiProperty({ example: 7, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    enum: RatingTypeEnum,
    default: RatingTypeEnum.SELF,
    description: 'Type of the rating',
  })
  @IsEnum(RatingTypeEnum, {
    message: `Rating Type must be one of: ${Object.values(RatingTypeEnum).join(', ')}`,
  })
  ratingType: RatingTypeEnum;

  @IsString()
  @IsOptional()
  skillName?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  knows?: boolean;
}
