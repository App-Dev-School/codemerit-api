import { Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, Post, Req, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/typeorm/entities/user.entity';
import { AuthUser } from 'src/users/decorators/user.decorator';
import { LoginDto } from 'src/users/dtos/Login.dto';
import { SignUpDto } from 'src/users/dtos/Signup.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { UserJwtResponse } from './user-jwt.interface';
import { MailService } from 'src/common/services/mail.service';

@ApiTags('Auth')
@UseInterceptors(TransformInterceptor)
@Controller('auth')
export class AuthController {
  //Crashes on injecting , private readonly mailService: MailService
  constructor(private readonly authService: AuthService, private readonly mailService: MailService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    try {
      const signUpResponse = await this.authService.signUp(signupDto);
      Logger.log("CreateUserAPI 1 => "+JSON.stringify(signUpResponse));
      const emailContent = `<h4>Welcome ${signupDto.firstName}!</h4><h4>Welcome to CodeMerit</h4>`;
      const mail = await this.mailService.sendMail(signupDto.email, emailContent);
      Logger.log("CreateUserAPI 2 @mail => "+JSON.stringify(mail));
      return signUpResponse;
    } catch (err) {
      //Good error handling pattern to customize the error message
      Logger.log("CreateUserAPI catch => "+JSON.stringify(err));
      if (err.code == 23505) {
        Logger.log(err.message, err.stack);
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }
      Logger.log("CreateUserAPI catch =>", err.message, err.stack);
      throw new InternalServerErrorException(
        'Something went wrong, Try again!',
      );
    }
  }

  //Add an interceptor on this endpoint
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<UserJwtResponse> {
    // const loginRes = this.authService.login(loginDto);
    // if(loginRes){
    //   return this.authService.login(loginDto);
    // }
    return this.authService.login(loginDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@AuthUser() user: User) {
    const logoutResult = this.authService.logout(user['id']);
    return {message: "Logged out successfully.", data: {
      user: user,
      logoutResult: logoutResult,
      userId: user['id']
    }};
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@AuthUser() req: Request) {
    const userId = req['sub'];
    const refreshToken = req['refreshToken'];
    Logger.debug("refreshTokens0## "+userId+" => "+refreshToken);
    return this.authService.refreshTokens(userId, refreshToken);
  }
  
  @Get('/profile')
  @UseGuards(AccessTokenGuard)
  //@UseInterceptors(TokenInterceptor)
  getProfile(@AuthUser() user: User) {
    Logger.log("##ThatUser => "+JSON.stringify(user));
    //extract auth header
    //verify and fetch user details
    try {
      return {message: `Welcome ${user.firstName} !`, data: {details: user, greetings: 'Here is your SkillTest profile'}};
    } catch (error) {
      throw new UnauthorizedException(
        `Looks like you could not be authenticated.`,
      );
    }
  }
}
