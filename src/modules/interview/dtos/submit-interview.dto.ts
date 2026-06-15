import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InterviewStatusEnum } from 'src/common/enum/interview-status.enum';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';

export class SkillRatingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  skillId: number;

  @ApiProperty({
    enum: SkillTypeEnum,
    example: SkillTypeEnum.SUBJECT,
  })
  @IsEnum(SkillTypeEnum)
  skillType: SkillTypeEnum;

  @ApiProperty({ example: 4 })
  @IsInt()
  rating: number;
}

export class SubmitInterviewDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  interviewId: number;

  @ApiProperty({
    enum: InterviewStatusEnum,
    example: InterviewStatusEnum.COMPLETED,
  })
  @IsEnum(InterviewStatusEnum)
  status: InterviewStatusEnum;

  @ApiPropertyOptional({
    example: 'Strong backend fundamentals and good communication.',
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    example: 'Candidate did not join the scheduled interview.',
  })
  @IsOptional()
  @IsString()
  declineReason?: string;

  @ApiProperty({
    type: [SkillRatingDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillRatingDto)
  skillRatings: SkillRatingDto[];
}
