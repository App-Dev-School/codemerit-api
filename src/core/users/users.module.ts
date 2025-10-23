// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserOtpService } from './providers/user-otp.service';
import { UserPerformanceService } from './providers/user-performance.service';
import { UserProfileService } from './providers/user-profile.service';
import { UserService } from './providers/user.service';
import { UsersController } from './users.controller';
import { AppNotificationModule } from 'src/modules/notification/app-notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserOtp]), AppNotificationModule],
  providers: [UserService, UserOtpService, UserProfileService,
    UserPerformanceService],
  controllers: [UsersController],
  exports: [UserService, UserOtpService, UserProfileService, UserPerformanceService],
})
export class UsersModule { }
