import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { ITimeStamp } from './timestamp.interface';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { AuditEntity } from '../entities/audit.entity';

export interface IUser {
  // firstName: string;
  // lastName: string;
  // email: string;
  // salt?: string;
  // password?: string;
  // roles: string;
  // status: string;
  // googleId?: string;
  // accessToken?: string;
  // refreshToken?: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  role: UserRoleEnum;
  designation: string;
  city: string;
  country: string;
  password: string;
  image: string;
  level: string;
  points?: number;
  token?: string;
  accountStatus: AccountStatusEnum;
  audit: ITimeStamp;
}
