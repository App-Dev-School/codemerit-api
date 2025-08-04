import { LabelEnum } from 'src/common/enum/label.enum';
import { ITimeStamp } from './timestamp.interface';
import { LavelEnum } from 'src/common/enum/lavel.enum';

export interface ITrivia {
  question: string;
  // topicId: number;
  subjectId: number;
  image: string;
  label: LabelEnum;
  tag: string;
  level: LavelEnum;
  marks: number;
  slug: string;
  isPublished: boolean;
  answer: string;
  hint: string;
  numReads: number;
  numQuizzes: number;
  audit: ITimeStamp;
}
