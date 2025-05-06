import { ITimeStamp } from './timestamp.interface';

export interface ISubject extends ITimeStamp {
  title: string;
  description: string;
  body: string;
  scope: string;
  image: string;
  color: string;
  isPublished: boolean;
  numSubscribers: number;
  numVotes: number;
  numTopics: number;
  numLessons: number;
  numQuestions: number;
  numTrivia: number;
  numQuizzes: number;
}
