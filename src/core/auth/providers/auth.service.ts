import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { User } from 'src/common/typeorm/entities/user.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserProfileService } from 'src/core/users/providers/user-profile.service';
import { UserService } from 'src/core/users/providers/user.service';
import { AccountVerificationDto } from '../dto/account-verification.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly userProfileService: UserProfileService,
  ) {}

  async validateUser(email: string, pass: string) {
    if (email && pass) {
      const user = await this.usersService.findByEmailForLogin(email);
      if (!user) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          'User account not found.',
        );
      }
      if (user && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      } else {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          'Incorrect Password. Please try again.',
        );
      }
    }
    return null;
  }

  async login(user: User) {
    //Auto ACC_VERIFY without notification + test email
    if (user.accountStatus != AccountStatusEnum.ACTIVE) {
      //Enable instant verification. Do not throw error if password is validated
      /*
      throw new HttpException(
        'Please verify your account to sign in.',
        HttpStatus.NOT_ACCEPTABLE,
      );
      */
      const msg = 'Your account is now verified.';
      //Do - Send a notification to the user
      const updateStatus = this.usersService.updateUserAccountStatus(
        user?.id,
        AccountStatusEnum.ACTIVE,
      );
      console.log(
        'LoginAPID AuthService :: Account Activated =>',
        updateStatus,
      );
    }
    const payload: any = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    console.log('JWT Sign Payload =>', payload);
    const token = this.jwtService.sign(payload);
    const profile = await this.userProfileService.findOneByUserId(user?.id);
    console.log("User Login user", user);
    const userData = await this.usersService.findByEmail(
        user?.email);
        console.log("LoginProcessor userData", userData);
    const response = new LoginResponseDto({
      ...userData,
      token,
      profile,
    });
    return response;
  }

    async autoLogin(user: User) {
    const payload: any = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    //do not attach profile level details
    const response = new LoginResponseDto({
      ...user,
      token,
      //profile,
    });
    return response;
  }

  async signup(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async accountVerification(accountVerificationDto: AccountVerificationDto) {
    return this.usersService.acoountVerification(accountVerificationDto);
  }
}
