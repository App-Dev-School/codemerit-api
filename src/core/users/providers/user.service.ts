import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { generate6DigitNumber } from 'src/common/utils/common-functions';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { AccountVerificationDto } from 'src/core/auth/dto/account-verification.dto';
import { CreateUserDto } from 'src/core/auth/dto/create-user.dto';
import { UserWithDesignation } from 'src/core/auth/dto/login-response.dto';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserProfileResponseDto } from '../dtos/user-profile-response.dto';
import { AccountStatusEnum } from '../enums/account-status.enum';
import { UserOtpTagsEnum } from '../enums/user-otp-Tags.enum';
import { UserOtpService } from './user-otp.service';
import { UserProfileService } from './user-profile.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userOtpService: UserOtpService,
    private readonly userProfileService: UserProfileService,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<CreateUserDto>): Promise<User> {
    const existingEmail = await this.findByEmail(data.email);
    console.log('existingEmail', existingEmail);

    if (existingEmail) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        `E-mail already exists.`,
      );
    }

    if (data.mobile) {
      const existingMobile = await this.findByMobile(data.mobile);
      if (existingMobile) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          `Mobile number already exists.`,
        );
      }
    }

    //Start Query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = this.userRepo.create(data as Partial<User>);
      const pass = generate6DigitNumber();
      user.password = await bcrypt.hash(pass, 10);
      const fullname = user.firstName + ' ' + user.lastName;
      let username = generateSlug(fullname);
      const existing = await this.userRepo.findOne({ where: { username } });
      if (existing) {
        username = generateUniqueSlug(fullname);
      }
      user.username = username;
      const errors = await validate(user);
      if (errors.length) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          `User validation failed`,
        );
      }
      const savedUser = await queryRunner.manager.save(user);
      const profile = new Profile();
      profile.userId = savedUser.id;
      //validate on client
	  if (data.about) {
        profile.about = data.about;
      }
      if (data.linkedinUrl) {
        profile.linkedinUrl = data.linkedinUrl;
      }
      if (data.googleId) {
        profile.googleId = data.googleId;
      }
      if (data.linkedinId) {
        profile.linkedinId = data.linkedinId;
      }
      profile.auth_provider = 'Native';
      await queryRunner.manager.save(profile);
      await queryRunner.commitTransaction();
      //save otp
      try {
        const otp = await this.sendOtp(
          savedUser?.email,
          pass,
          UserOtpTagsEnum.ACC_VERIFY,
        );
        console.log('CMRegistration Send otp => ', otp);
      } catch (error) {
        console.log('CMRegistration Send otp exception => ', error);
      }

      return this.findOne(savedUser?.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<UserWithDesignation | undefined> {
    //Gives all fields
    const user = await this.userRepo.findOne({
    where: { email },
    relations: ['userJobRole'],
  });

  if (!user) return undefined;

  // filter designation fields
  return {
    ...user,
    userDesignation: user.userJobRole
      ? {
          id: user.userJobRole.id,
          title: user.userJobRole.title,
          slug: user.userJobRole.slug,
        }
      : null,
  };
  }

  async findByEmailForLogin(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'username',
        'role',
        'email',
        'mobile',
        'password',
        'accountStatus',
      ],
    });
  }

  async findByMobile(mobile: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { mobile } });
  }

  async findByUsername(
    username: string,
  ): Promise<UserProfileResponseDto | undefined> {
    const user = await this.userRepo.findOne({ where: { username } });

    if (!user) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'User not Found.',
      );
    }
    const profile = await this.userProfileService.findOneByUserId(user?.id);
    const userProfileResponse: UserProfileResponseDto = {
      ...user,
      profile,
    };

    return userProfileResponse;
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { id } });
  }

  async getOwnUserInfo(
    id: number,
  ): Promise<UserProfileResponseDto | undefined> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'User not Found.',
      );
    }
    const profile = await this.userProfileService.findOneByUserId(user?.id);
    const userProfileResponse: UserProfileResponseDto = {
      ...user,
      profile,
    };

    return userProfileResponse;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findUserList(): Promise<User[]> {
    return this.userRepo.find({
      select: [
        'firstName',
        'lastName',
        'username',
        'role',
        'designation',
        'city',
        'country',
        'email',
        'mobile',
        'level',
        'points',
        'accountStatus',
        'createdAt',
      ],
    });
  }
  async updateUserAccountStatus(
    id: number,
    accountStatusEnum: AccountStatusEnum,
  ): Promise<boolean> {
    const result = await this.userRepo.update(
      { id: id },
      { accountStatus: accountStatusEnum },
    );
    if (result.affected && result.affected > 0) {
      return true;
    } else {
      return false;
    }
  }

  async updateUserPassword(id: number, password: string): Promise<boolean> {
    const result = await this.userRepo.update(
      { id: id },
      { password: password },
    );
    if (result.affected && result.affected > 0) {
      return true;
    } else {
      return false;
    }
  }

  async sendOtp(
    email: string,
    pass: string,
    tag: UserOtpTagsEnum,
  ): Promise<string | null> {
    const user: User = await this.findByEmail(email);
    if (!user) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid e-mail address.',
      );
    } else if (
      user.accountStatus == AccountStatusEnum.ACTIVE &&
      tag == UserOtpTagsEnum.ACC_VERIFY
    ) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'User is already verified.',
      );
    }
    let userOtp: UserOtp = new UserOtp();
    userOtp.otp = pass ? pass : generate6DigitNumber();
    userOtp.userId = user?.id;
    userOtp.tag = tag;
    const result = await this.userOtpService.create(userOtp);

    if (result) {
      return 'Successfully send OTP';
    }
    return null;
  }

  async acoountVerification(
    accountVerificationDto: AccountVerificationDto,
  ): Promise<string | null> {
    const user: User = await this.findByEmail(accountVerificationDto?.email);

    if (!user) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid e-mail address.',
      );
    }
    const userOtpList: UserOtp[] = await this.userOtpService.findByUserIdTags(
      user.id,
      accountVerificationDto.tag,
    );
    if (
      userOtpList &&
      userOtpList?.length > 0 &&
      accountVerificationDto.otp === userOtpList[0].otp
    ) {
      let userOtp: UserOtp = userOtpList[0];
      userOtp.isUsed = true;
      const result = await this.userOtpService.updateIsUsed(userOtp?.id);
      let userRs: boolean = false;
      let msg: string = '';
      if (accountVerificationDto.tag == UserOtpTagsEnum.ACC_VERIFY) {
        userRs = await this.updateUserAccountStatus(
          user?.id,
          AccountStatusEnum.ACTIVE,
        );
        msg = 'Your account is now verified.';
      }
      if (accountVerificationDto.tag == UserOtpTagsEnum.PWD_RECOVER) {
        userRs = await this.updateUserPassword(
          user?.id,
          accountVerificationDto?.password,
        );
        msg = 'Successfully change your password.';
      }
      if (result && userRs) {
        return msg;
      } else {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          'Account not verified. Please try again.',
        );
      }
    } else {
      // throw new HttpException('OTP Mismatch', HttpStatus.NOT_ACCEPTABLE);
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'OTP mismatch. Please try again.');
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'User not found');
    }
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (user) {
      await this.userRepo.update(id, {
        accountStatus: AccountStatusEnum.BLOCKED,
      });
      await this.userProfileService.removeByUserId(id);
      await this.userRepo.softDelete({ id: id });
    } else {
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'User not found');
    }
  }
}
