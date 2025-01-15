import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/users/dtos/Login.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UserJwtResponse } from './user-jwt.interface';
import { User } from 'src/typeorm/entities/user.entity';
import { CreateUserParams } from 'src/utils/types';
import { SignUpResponse } from 'src/users/dtos/SignUpResponse.dto';
import { LoginResponseDto } from 'src/users/dtos/loginResponse.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService) {
  }

  async validateUserById(userId: string) {
    return await this.userService.findUserById(parseInt(userId));
  }

  async signUp(signupDto: CreateUserParams) {
    /** Validate request **/
    const { username } = signupDto;
    const existingUsername = await this.userService.findUserByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already exists. Please try another username.');
    }
    const { email } = signupDto;
    const existingEmail = await this.userService.findUserByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('E-mail already registered. Please try to login.');
    }
    /** Ends Validation **/

    //async signUp(signupDto: CreateUserParams): Promise<SignUpResponse> {
    const newUser = await this.userService.createUser(signupDto);
    //const signInResponse: SignUpResponse = { message: "Registration successful", data: userResult };

    console.log("###1 ", typeof newUser);
    //return newUser;

    const signUpresponse: CreateUserParams = {
      firstName: (await newUser).firstName,
      lastName: signupDto.lastName,
      email: signupDto.email,
      username: signupDto.username,
      roles: signupDto.roles
    };
    //signUpresponse.firstName = signupDto.firstName;
    const payload = { newUser };
    //const accessToken = this.jwtService.sign(payload);
    const tokens = await this.getTokens(payload.newUser.id, payload.newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    const signInResponse: SignUpResponse = {
      message: "Registration successful",
      data:
      {
        user: signUpresponse,
        accessToken: tokens.refreshToken,
        extras: tokens.accessToken,
      }
    };
    return signInResponse;

    // userResult.then((userDetail: any) => {
    //     if (userDetail) {
    //         // const signInResponse  = {
    //         // message :"Registration successful",
    //         // //data : JSON.stringify(userResult)
    //         // data : userResult
    //         // }
    //         // //const signInResponse: SignUpResponse = { message: "Registration successful", data: JSON.stringify(userResult) };
    //         // return signInResponse;
    //         const payload = { userResult };
    //         const accessToken = this.jwtService.sign(payload);
    //         const signInResponse: UserJwtResponse = { message: "Registration successful", data: { user: userDetail, accessToken: accessToken } };
    //         return signInResponse;
    //     }
    // });

    // });
    //CreateUserParams
    // const userResponse = new SignUpResponse();
    // userResponse.message = "Registration successful";
    // userResponse.data = userResult;
  }

  async login(loginDto: LoginDto): Promise<UserJwtResponse> {
    const userResult = await this.userService.signIn(loginDto);

    if (!userResult) {
      throw new UnauthorizedException('Invalid Credentials!');
      //return null;
    }
    const payload = { ...userResult };
    Logger.log("##AuthStep2: AccessToken Generation Starts => " + JSON.stringify(payload));
    const accessToken = await this.jwtService.sign(payload);
    Logger.log("##AuthStep3: AccessToken generated => " + JSON.stringify(accessToken));
    const signInResponse: UserJwtResponse = { message: "Success", data: { user: userResult, accessToken: accessToken } };
    return signInResponse;
  }

  signToken(user: User): string {
    const payload = {
      sub: user.id,
    };
    return this.jwtService.sign(payload);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: number) {
    this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findUserById(parseInt(userId));
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    // const refreshTokenMatches = await argon2.verify(
    //   user.refreshToken,
    //   refreshToken,
    // );
    Logger.debug("refreshTokens1## User => "+user);
    Logger.debug("refreshTokens1## "+userId+": Passed Token => "+refreshToken);
    Logger.debug("AuthRefreshToken "+userId+": Existing Refresh Token => "+user.refreshToken);
    //Logger.debug("refreshTokens1## "+userId+" => "+refreshToken);
    //if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.username);
    Logger.debug("AuthRefreshToken "+userId+": New Refresh Token => "+tokens.refreshToken);
    Logger.debug("refreshTokens1## "+userId+": New Access Token => "+tokens.accessToken);
    //await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens.refreshToken;
  }

  hashData(data: string) {
    //return argon2.hash(data);
    return data;
  }
}