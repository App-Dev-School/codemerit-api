// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserOtpService } from './providers/user-otp.service';
import { UserPerformanceService } from './providers/user-performance.service';
import { UserProfileService } from './providers/user-profile.service';
import { UserProfileAggregatorService } from './providers/user-profile-aggregator.service';
import { UserService } from './providers/user.service';
import { UsersController } from './users.controller';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { MasterModule } from 'src/modules/master/master.module';
import { MailModule } from 'src/common/mail/mail.module';
import { UserPermissionModule } from 'src/modules/user-permission/user-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, UserOtp, UserJobRole, JobRole]),
    NotificationModule,
    MasterModule,
    MailModule,
    UserPermissionModule,
  ],
  providers: [
    UserService,
    UserOtpService,
    UserProfileService,
    UserPerformanceService,
    UserProfileAggregatorService,
  ],
  controllers: [UsersController],
  exports: [
    UserService,
    UserOtpService,
    UserProfileService,
    UserPerformanceService,
    UserProfileAggregatorService,
  ],
})
export class UsersModule {}
