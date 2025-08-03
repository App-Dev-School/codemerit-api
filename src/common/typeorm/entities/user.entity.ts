import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IUser } from '../interface/user.interface';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

@Entity()
export class User extends AbstractEntity implements IUser {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
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
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  designation: string;

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
  })
  token?: string;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    nullable: false,
    default: AccountStatusEnum.PENDING,
  })
  accountStatus: AccountStatusEnum;

    @Column({ name: 'created_by', default: null, select: false })
    createdBy: number;
  
    @Column({ name: 'updated_by', default: null, select: false })
    updatedBy: number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
  
    @DeleteDateColumn({ name: 'deleted_at', default: null, select: false })
    deletedAt: Date;
}
