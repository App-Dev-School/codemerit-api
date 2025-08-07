// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UsersService } from './providers/users.service';
import { UserOtpService } from './providers/user-otp.service';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { Profile } from 'src/common/typeorm/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserOtp])],
  providers: [UsersService, UserOtpService],
  controllers: [UsersController],
  exports: [UsersService, UserOtpService],
})
export class UsersModule {}
