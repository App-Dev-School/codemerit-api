import { LabelEnum } from 'src/common/enum/label.enum';
import { ITimeStamp } from './timestamp.interface';

export interface ITopic extends ITimeStamp {
  id: number;
  title: string;
  subjectId: number;
  image: string;
  label: LabelEnum;
  color: string;
  slug: string;
  order: number;
  parent?: number;
  isPublished: boolean;
  description: string;
  goal: string;
  numVotes: number;
  numLessons: number;
  numQuestions: number;
  numTrivia: number;
  numQuizzes: number;
}
