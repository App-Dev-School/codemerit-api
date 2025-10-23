import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccountVerificationDto } from './dto/account-verification.dto';
import { UserService } from '../users/providers/user.service';
import { ApiResponse } from 'src/common/utils/api-response';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UserService,
  ) { }

  @Post('register')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.authService.signup(createUserDto);
    if (createUserDto.flow && createUserDto.flow === 'QuickRegistration') {
      const resultWithToken = await this.authService.autoLogin(result);
      return new ApiResponse('Successfully Registered', resultWithToken);
    }
    return new ApiResponse('Successfully Registered', result);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Request() req,
    @Body() body: LoginDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.authService.login(req.user);
    return new ApiResponse('Successfully Logged In', result);
  }

  @Post('sent-otp')
  async sendOtp(@Body() query: SendOtpDto): Promise<ApiResponse<any>> {
    const result = await this.usersService.sendOtp(
      query.email,
      null,
      query.tag,
    );
    return new ApiResponse('OTP sent successfully.', result);
  }

  @Post('verify')
  async accountVerification(
    @Body()
    accountVerificationDto: AccountVerificationDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.accountVerification(
      accountVerificationDto,
    );
    return new ApiResponse('Account verified successfully.', result);
  }

  @Post('recover-password')
  async recoverPassword(
    @Body()
    recoverPassword: AccountVerificationDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.accountVerification(recoverPassword);
    return new ApiResponse('Successfully Recovered Password', result);
  }
}
