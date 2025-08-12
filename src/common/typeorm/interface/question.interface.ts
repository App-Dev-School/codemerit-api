import { LabelEnum } from 'src/common/enum/label.enum';
import { ITimeStamp } from './timestamp.interface';
import { DifficultyLevelEnum } from 'src/common/enum/lavel.enum';
import { QuestionType } from 'src/common/enum/questionType';
import { QuestionStatus } from 'src/common/enum/questionStatus.enum';

export interface IQuestion {
  question: string;
  subjectId: number;
  questionType: QuestionType;
  level: DifficultyLevelEnum;
  tag: string;
  marks: number;
  slug: string;
  answer: string;
  hint: string;
  label: LabelEnum;
  status: QuestionStatus;
  audit: ITimeStamp;
}
