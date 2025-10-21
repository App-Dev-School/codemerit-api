import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

export class LoginResponseDto implements LoginUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string;
  role: UserRoleEnum;
  designation: number;
  userDesignation: {
    id?: number;
    title?: string;
    slug?: string;
  }
  city?: string | null;
  country: string | null;
  mobile?: string | null;
  image?: string | null;
  level?: string | null;
  points?: number;
  accountStatus: AccountStatusEnum;
  token: string;
  //other conditional fields
  profile: Profile;
  mySubjects: Subject[];
  permissions: UserPermission[];
  //fields for admin
  lmsMetrics: {
    numAllQuestions: number;
    numAllPublishedQuestions: number;
    numTriviaQuestions: number;
    numAllTopics: number;
    numAllSubjects: number;
    numAllInterviews: number;
    numAllQuiz: number;
  }
  userMetrics: {
    totalUsers: number;
    pendingUsers: number;
    activeUsers: number;
  }

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}

export interface LoginUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string;
  role: UserRoleEnum;
  designation: number;
  userDesignation: {
    id?: number;
    title?: string;
    slug?: string;
  }
  city?: string | null;
  country: string | null;
  mobile?: string | null;
  image?: string | null;
  level?: string | null;
  points?: number;
  accountStatus: AccountStatusEnum;
  token: string;
}

export type UserWithDesignation = User & {
  userDesignation?: {
    id: number;
    title: string;
    slug: string;
  } | null;
};
