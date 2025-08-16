import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

export interface GetUserRequestDto {
  id: number;
  username: string;
  role: UserRoleEnum;
}
