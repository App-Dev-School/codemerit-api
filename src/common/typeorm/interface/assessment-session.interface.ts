import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { SkillRating } from '../entities/skill-rating.entity';

export interface IAssessmentSession {
  id?: number;
  userId: number;
  assessmentTitle?: string;
  ratingType: RatingTypeEnum;
  ratedBy?: number;
  notes?: string;
  skillRatings?: SkillRating[];
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
