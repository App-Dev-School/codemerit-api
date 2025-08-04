import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IUserOtp } from '../interface/user-otp.interface';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';
import { AuditEntity } from './audit.entity';

@Entity()
export class UserOtp extends AbstractEntity implements IUserOtp {
  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  otp: string;

  @Column({
    type: 'enum',
    enum: UserOtpTagsEnum,
    nullable: false,
    default: UserOtpTagsEnum.ACC_VERIFY,
  })
  tag: UserOtpTagsEnum;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isUsed: boolean;
  
    @Column(type => AuditEntity)
    audit: AuditEntity;
}
