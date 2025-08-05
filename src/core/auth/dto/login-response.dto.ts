import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

export class LoginResponseDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string;
  role: UserRoleEnum;
  designation: string | null;
  city: string | null;
  country: string | null;
  mobile: string | null;
  image: string | null;
  level: string | null;
  points?: number;
  accountStatus: AccountStatusEnum;
  token: string;
  //other conditional fields
  profile: Profile;
  mySubjects: Subject[];
  //fields for admin
  lmsMetrics: {
    numAllQuestions: number;
    numAllPublishedQuestions: number;
    numTriviaQuestions: number;
    numAllTopics: number;
    numAllSubjects: number;
    numAllInterviews: number;
    numAllQuiz : number;
  }
  userMetrics: {
    totalUsers: number;
    pendingUsers : number;
    activeUsers: number;
  }

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
