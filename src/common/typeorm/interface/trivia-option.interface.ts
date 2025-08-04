import { ITimeStamp } from './timestamp.interface';

export interface ITriviaOption {
  id: number;
  triviaId: number;
  optionId: number;
  audit: ITimeStamp;
}
