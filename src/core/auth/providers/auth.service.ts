import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserProfileService } from 'src/core/users/providers/user-profile.service';
import { UserService } from 'src/core/users/providers/user.service';
import { AccountVerificationDto } from '../dto/account-verification.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserPermissionService } from 'src/modules/user-permission/providers/user-permission.service';
import { TopicAnalysisService } from 'src/modules/master/providers/topic-analysis.service';
import { SubjectAnalysisService } from 'src/modules/master/providers/subject-analysis.service';
import { ApiUsageService } from 'src/common/services/api-usage.service';
import { MasterService } from 'src/modules/master/providers/master.service';
import { BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

interface LinkedInProfile {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

@Injectable()
export class AuthService {
  private readonly linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
  private readonly linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  private readonly linkedinRedirectUri = process.env.LINKEDIN_REDIRECT_URI;

  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly masterService: MasterService,
    private readonly userProfileService: UserProfileService,
    private readonly userPermissionService: UserPermissionService,
    private readonly subjectAnalyzer: SubjectAnalysisService,
    private readonly topicAnalysisProvider: TopicAnalysisService,
    private readonly apiUsageService: ApiUsageService,

    @InjectRepository(UserJobRole)
    private userJobRoleRepo: Repository<UserJobRole>,
    private readonly dataSource: DataSource,
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
    //temporary logic. To be updated after e-mail integration
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
    }
    const payload: any = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    //console.log('JWT Sign Payload =>', payload);
    const token = this.jwtService.sign(payload);
    const profile = await this.userProfileService.findOneByUserId(user?.id);
    const permissions = await this.userPermissionService.findUserPermissionList(
      user?.id,
    );
    //console.log('User Login user', user);
    const userData = await this.usersService.findByEmail(user?.email);
    const courseStats = await this.subjectAnalyzer.getJobSubjectDashboards(
      user?.id,
      false,
    );
    // const topicStats = await this.topicAnalysisProvider.getAllTopicStats(
    //   user?.id,
    //   false,
    // );
    const apiUsage = await this.apiUsageService.findByUserId(user?.id);

    // Fetch user job role enrollments
    const enrollments = await this.userJobRoleRepo.find({
      where: { userId: user.id },
      relations: ['jobRole'],
    });

    const userJobRoles = enrollments.map((enrollment) => ({
      userId: enrollment.userId,
      jobRoleId: enrollment.jobRoleId,
      jobRoleTitle: enrollment.jobRole?.title || null,
      createdAt: enrollment.createdAt,
    }));

    const quizStats = await this.masterService.getUserQuizStats(userData.id);

    const response = new LoginResponseDto({
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      city: userData.city,
      country: userData.country,
      mobile: userData.mobile,
      image: userData.image,
      level: userData.level,
      points: userData.points,
      accountStatus: userData.accountStatus,
      token,
      profile,
      permissions,
      userJobRoles,
      courseStats,
      quizStats,
      apiUsage: {
        count: apiUsage?.count ?? 0,
        lastHitAt: apiUsage?.lastHitAt ?? null,
      },
      //topicStats
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
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      city: user.city,
      country: user.country,
      mobile: user.mobile,
      image: user.image,
      level: user.level,
      points: user.points,
      accountStatus: user.accountStatus,
      token,
      //profile,
    });
    return response;
  }
  async handleGoogleCallback(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new BadRequestException('Invalid Google token.');
      }

      const { sub, email, given_name, picture } = payload;
      const [firstName, ...lastNameParts] = (given_name || '')
        .trim()
        .split(' ');
      const lastName = lastNameParts.join(' ');

      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        return this.login(existingUser);
      }

      return {
        status: 'new_user',
        socialProfile: {
          auth_provider: 'Google',
          googleId: sub,
          email,
          firstName,
          lastName,
          image: picture || '',
          username: `go_${sub.substring(0, 15)}`,
          password: crypto.randomBytes(16).toString('hex'),
          accountStatus: AccountStatusEnum.ACTIVE,
          role: UserRoleEnum.USER,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Google authentication failed: ${error.message}`,
      );
    }
  }

  async handleLinkedinCallback(code: string) {
    const accessToken = await this.exchangeCodeForToken(code);
    const profile = await this.fetchLinkedInProfile(accessToken);

    const [firstName, ...lastNameParts] = (profile.given_name || '')
      .trim()
      .split(' ');
    const lastName = lastNameParts.join(' ');

    const existingUser = await this.usersService.findByEmail(profile.email);

    if (existingUser) {
      return this.login(existingUser);
    }

    return {
      status: 'new_user',
      socialProfile: {
        auth_provider: 'LinkedIn',
        linkedinId: profile.sub,
        email: profile.email,
        firstName,
        lastName,
        image: profile.picture || '',
        username: `lnk_${profile.sub.substring(0, 15)}`,
        password: crypto.randomBytes(16).toString('hex'),
        accountStatus: AccountStatusEnum.ACTIVE,
        role: UserRoleEnum.USER,
      },
    };
  }

  private async exchangeCodeForToken(code: string): Promise<string> {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.linkedinClientId,
      client_secret: this.linkedinClientSecret,
      redirect_uri: this.linkedinRedirectUri,
    });

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  }

  private async fetchLinkedInProfile(
    accessToken: string,
  ): Promise<LinkedInProfile> {
    const response = await axios.get<LinkedInProfile>(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  async signup(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async accountVerification(accountVerificationDto: AccountVerificationDto) {
    return this.usersService.acoountVerification(accountVerificationDto);
  }
}
