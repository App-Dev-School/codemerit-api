import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';

export interface ISkillRating {
  id: number;
  assessmentSessionId: number;
  skillId: number;
  skillType: SkillTypeEnum;
  rating: number;
}
