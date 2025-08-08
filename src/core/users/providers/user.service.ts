import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { generate6DigitNumber } from 'src/common/utils/common-functions';
import { UserOtpService } from './user-otp.service';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { UserOtpTagsEnum } from '../enums/user-otp-Tags.enum';
import { AccountVerificationDto } from 'src/core/auth/dto/account-verification.dto';
import { AccountStatusEnum } from '../enums/account-status.enum';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { validate } from 'class-validator';
import { UserProfileService } from './user-profile.service';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private readonly userOtpService: UserOtpService,
    private readonly userProfileService: UserProfileService,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedProfile = await this.userProfileService.create(
        queryRunner.manager,
      );
      const user = this.usersRepo.create(data);
      const pass = generate6DigitNumber();
      user.password = await bcrypt.hash(pass, 10); //pass.toString();
      const fullname = user.firstName + ' ' + user.lastName;
      let username = generateSlug(fullname);
      const existing = await this.usersRepo.findOne({ where: { username } });
      if (existing) {
        username = generateUniqueSlug(fullname);
      }
      user.username = username;
      user.profileId = savedProfile.id;
      const errors = await validate(user);
      if (errors.length) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          `User validation failed`,
        );
      }
      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      //save otp
      const otp = await this.sendOtp(
        savedUser?.email,
        data?.password,
        UserOtpTagsEnum.ACC_VERIFY,
      );
      //save otp
      if (otp) {
        // send email with data?.password and related information
      } else {
        //failed to send otp
      }

      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findUserList(): Promise<User[]> {
    return this.usersRepo.find({
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
      ],
    });
  }
  async updateUserAccountStatus(
    id: number,
    accountStatusEnum: AccountStatusEnum,
  ): Promise<boolean> {
    const result = await this.usersRepo.update(
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
    const result = await this.usersRepo.update(
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

    // const userOtpList: UserOtp[] = await this.userOtpService.findByUserIdTags(
    //   user.id,
    //   tag,
    // );
    // if (userOtpList && userOtpList?.length >= 3) {
    //   throw new HttpException(
    //     'Already applied 3 times.',
    //     HttpStatus.NOT_ACCEPTABLE,
    //   );
    // }
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
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'OTP Mismatch.');
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
    return this.usersRepo.save(user);
  }
}
