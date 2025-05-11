import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/core/users/providers/users.service';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from 'src/common/typeorm/entities/user.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { AccountVerificationDto } from '../dto/account-verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    if(email && pass){
      const user = await this.usersService.findByEmail(email);
      if (user && user.password) {
        // if (user && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: User) {
    if (user.accountStatus != AccountStatusEnum.ACTIVE) {
      throw new HttpException(
        'Unable to login. Please Approve your account or contact with admin',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async accountVerification(accountVerificationDto: AccountVerificationDto) {
    return this.usersService.acoountVerification(accountVerificationDto);
  }
}
