import { ITimeStamp } from './timestamp.interface';

export interface ITriviaTopic extends ITimeStamp {
  id: number;
  triviaId: number;
  topicId: number;
}
