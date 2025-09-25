// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserService } from './providers/user.service';
import { UserOtpService } from './providers/user-otp.service';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { UserProfileService } from './providers/user-profile.service';
import { UserPerformanceService } from './providers/user-performance.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserOtp])],
  providers: [UserService, UserOtpService, UserProfileService, UserPerformanceService],
  controllers: [UsersController],
  exports: [UserService, UserOtpService, UserProfileService, UserPerformanceService],
})
export class UsersModule {}
