import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

export interface IUser {
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
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
