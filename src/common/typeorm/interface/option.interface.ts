import { ITimeStamp } from './timestamp.interface';

export interface IOption extends ITimeStamp {
  id: number;
  option: string;
  correct: boolean;
  comment?: string;
}
