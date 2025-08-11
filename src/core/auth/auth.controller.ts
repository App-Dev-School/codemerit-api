import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccountVerificationDto } from './dto/account-verification.dto';
import { UserService } from '../users/providers/user.service';
import { UserOtpTagsEnum } from '../users/enums/user-otp-Tags.enum';
import { ApiResponse } from 'src/common/utils/api-response';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UserService,
  ) {}

  @Post('register')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.authService.signup(createUserDto);
    return new ApiResponse('Succesfully Registered', result);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Request() req,
    @Body() body: LoginDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.authService.login(req.user);
    return new ApiResponse('Succesfully Logged In', result);
  }

  @Post('sent-otp')
  async sendOtp(@Body() query: SendOtpDto): Promise<ApiResponse<any>> {
    const result = await this.usersService.sendOtp(
      query.email,
      null,
      query.tag,
    );
    return new ApiResponse('OTP sent succesfully.', result);
  }

  @Post('verify')
  async acoountVerification(
    @Body()
    accountVerificationDto: AccountVerificationDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.acoountVerification(
      accountVerificationDto,
    );
    return new ApiResponse('Account verified succesfully.', result);
  }

  @Post('recover-password')
  async recoverPassword(
    @Body()
    recoverPassword: AccountVerificationDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.acoountVerification(recoverPassword);
    return new ApiResponse('Succesfully Recovered Password', result);
  }
}
