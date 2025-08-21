import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';

export interface IQuestion {
  title: string;
  question: string;
  subjectId: number;
  questionType: QuestionTypeEnum;
  level: DifficultyLevelEnum;
  tag: string;
  marks: number;
  timeAllowed: number;
  slug: string;
  answer: string;
  hint: string;
  // label: LabelEnum;
  status: QuestionStatusEnum;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
