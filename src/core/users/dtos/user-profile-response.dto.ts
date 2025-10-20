import { UserRoleEnum } from '../enums/user-roles.enum';
import { AccountStatusEnum } from '../enums/account-status.enum';
import { Profile } from 'src/common/typeorm/entities/profile.entity';

export interface UserProfileResponseDto {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  role?: UserRoleEnum;
  designation?: number;
  userDesignation?: {
  id?: number;
  title?: string;
  slug?: string;
  }
  city?: string;
  country?: string;
  mobile?: string;
  image?: string;
  level?: string;
  points?: number;
  accountStatus?: AccountStatusEnum;
  profile: Profile;
}
