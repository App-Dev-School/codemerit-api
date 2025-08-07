import { ApiProperty } from '@nestjs/swagger';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { SkillRatingResponseDto } from './skill-rating-response';

export class AssessmentSessionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  assessmentTitle: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  ratedById?: number;

  @ApiProperty()
  ratedByName?: string;

  @ApiProperty({ enum: RatingTypeEnum })
  ratingType: RatingTypeEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [SkillRatingResponseDto] })
  skillRatings: SkillRatingResponseDto[];
}
