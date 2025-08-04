import { ITimeStamp } from './timestamp.interface';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';

export interface IUserOtp {
  id: number;
  userId: number;
  otp: string;
  tag: UserOtpTagsEnum;
  isUsed: boolean;
  audit: ITimeStamp;
}
