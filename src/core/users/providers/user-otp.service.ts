import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { UserOtpTagsEnum } from '../enums/user-otp-Tags.enum';

@Injectable()
export class UserOtpService {
  constructor(
    @InjectRepository(UserOtp)
    private userOtpRepo: Repository<UserOtp>,
  ) {}

  async create(data: Partial<UserOtp>): Promise<UserOtp | null> {
    const userOtp = this.userOtpRepo.create(data);
    return this.userOtpRepo.save(userOtp);
  }

  async findOne(id: number): Promise<UserOtp | undefined> {
    return this.userOtpRepo.findOne({ where: { id } });
  }

  async findByUserIdTags(
    userId: number,
    tag: UserOtpTagsEnum,
  ): Promise<UserOtp[] | undefined> {
    return this.userOtpRepo.find({
      where: {
        userId: userId,
        tag: tag,
        isUsed: false,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async updateIsUsed(id: number): Promise<boolean> {
    const result = await this.userOtpRepo.update(
      { id: id }, // WHERE condition
      { isUsed: true }, // Column(s) to update
    );
    if (result.affected && result.affected > 0) {
      return true;
    } else {
      return false;
    }
  }
}
