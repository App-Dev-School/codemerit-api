import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from './public.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { AccountVerificationDto } from './dto/account-verification.dto';
import { UsersService } from '../users/providers/users.service';
import { UserOtpTagsEnum } from '../users/enums/user-otp-Tags.enum';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('sent-otp')
  sendOtp(@Query('email') email: string, @Query('tag') tag: UserOtpTagsEnum) {
    return this.usersService.sendOtp(email, tag);
  }

  @Post('verify')
  acoountVerification(
    @Body()
    accountVerificationDto: AccountVerificationDto,
  ) {
    return this.usersService.acoountVerification(accountVerificationDto);
  }

  @Post('recover-password')
  recoverPassword(
    @Body()
    recoverPassword: AccountVerificationDto,
  ) {
    return this.usersService.acoountVerification(recoverPassword);
  }
}
