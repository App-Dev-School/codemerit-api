import { ITimeStamp } from './timestamp.interface';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';

export interface IUserOtp extends ITimeStamp {
  id: number;
  userId: number;
  otp: number;
  tag: UserOtpTagsEnum;
  isUsed: boolean;
}
