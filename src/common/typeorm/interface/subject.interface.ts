import { ITimeStamp } from './timestamp.interface';

export interface ISubject{
  title: string;
  description: string;
  body: string;
  scope: string;
  image: string;
  color: string;
  isPublished: boolean;
  audit: ITimeStamp;
}
