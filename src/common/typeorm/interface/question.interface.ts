import { LabelEnum } from 'src/common/enum/label.enum';
import { ITimeStamp } from './timestamp.interface';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';

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
