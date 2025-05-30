import { ITimeStamp } from './timestamp.interface';

export interface ITriviaOption extends ITimeStamp {
  id: number;
  triviaId: number;
  optionId: number;
}
