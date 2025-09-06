import { IsOptional } from 'class-validator';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn
} from 'typeorm';
import { IUser } from '../interface/user.interface';
import { AbstractEntity } from './abstract.entity';
import { JobRole } from './job-role.entity';

@Entity()
export class User extends AbstractEntity implements IUser {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: null,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    nullable: false,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  @Column({
    type: 'integer',
    nullable: true,
    default: null
  })
  designation?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  country: string;

  @IsOptional()
  // @Matches(/^[0-9]{10}$/, {
  //   message: 'Mobile must be a 10-digit number',
  // })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: null,
    unique: true,
  })
  mobile: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: null,
  })
  image: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  level: string;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  points?: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    default: null,
    select: false,
  })
  token?: string;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    nullable: false,
    default: AccountStatusEnum.PENDING,
  })
  accountStatus: AccountStatusEnum;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt', default: null, select: false })
  deletedAt: Date;
  
  @ManyToOne(() => JobRole, (jobRole) => jobRole.users, { eager: false })
  @JoinColumn({ name: 'designation' })
  userJobRole: JobRole;
}
