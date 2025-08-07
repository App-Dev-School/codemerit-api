import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';

// export class CreateSkillRatingDto {
//   @ApiProperty({ example: 1, description: 'User ID is required' })
//   @IsNumber({}, { message: 'userId must be a number' })
//   userId: number;

//   @ApiProperty({ example: 123, description: 'Skill Id is required' })
//   @IsNumber({}, { message: 'Skill Id must be a number' })
//   @IsNotEmpty({ message: 'skill id is required' })
//   skillId: number;

//   @ApiProperty({ enum: SkillTypeEnum, description: 'Type of the skill' })
//   @IsEnum(SkillTypeEnum, {
//     message: `skill Type must be one of: ${Object.values(SkillTypeEnum).join(', ')}`,
//   })
//   skillType: SkillTypeEnum;

//   @ApiProperty({ example: 4, description: 'Rating between 1 and 10' })
//   @IsNumber({}, { message: 'rating must be a number' })
//   @Min(1, { message: 'rating must be at least 1' })
//   @Max(10, { message: 'rating cannot exceed 10' })
//   rating: number;

//   @ApiPropertyOptional({
//     example: 2,
//     description: 'ID of the user who gave the rating',
//   })
//   @Optional()
//   @IsNumber({}, { message: 'Rated by must be a number' })
//   ratedBy: number;

//   @ApiProperty({
//     enum: RatingTypeEnum,
//     description: 'Type of rating (SELF or QUIZ)',
//   })
//   @IsEnum(RatingTypeEnum, {
//     message: `ratingType must be one of: ${Object.values(RatingTypeEnum).join(', ')}`,
//   })
//   ratingType: RatingTypeEnum;
// }

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
  @Min(1)
  @Max(10)
  rating: number;
}
