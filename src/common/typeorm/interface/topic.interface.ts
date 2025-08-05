import { TopicLabel } from 'src/common/enum/TopicLabel.enum';
import { ITimeStamp } from './timestamp.interface';

export interface ITopic {
  id: number;
  title: string;
  subjectId: number;
  image: string;
  label: TopicLabel;
  order: number;
  parent?: number;
  isPublished: boolean;
  description: string;
  weight: number;
  goal: string;
  votes: number;
  numLessons: number;
  numQuestions: number;
  numTrivia: number;
  numQuizzes: number;
  audit: ITimeStamp;
}
