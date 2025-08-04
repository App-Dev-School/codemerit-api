import { ITimeStamp } from './timestamp.interface';

export interface IOption {
  id: number;
  option: string;
  correct: boolean;
  comment?: string;
  audit: ITimeStamp;
}
