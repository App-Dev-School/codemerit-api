import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';
import { SkillRating } from '../entities/skill-rating.entity';
import { ITimeStamp } from './timestamp.interface';

export interface IAssessmentSession {
  id: number;
  userId: number;
  assessmentTitle: string;
  notes?: string;
  skillRatings: SkillRating[];
  audit: ITimeStamp;
  ratedBy?: number;
  ratingType: RatingTypeEnum;
}
