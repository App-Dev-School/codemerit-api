import { ITimeStamp } from './timestamp.interface';

export interface ITriviaTopic {
  id: number;
  triviaId: number;
  topicId: number;
  audit: ITimeStamp;
}
