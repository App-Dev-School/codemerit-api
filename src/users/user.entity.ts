import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/post.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';
import { UserStatus } from 'src/auth/enums/user_status.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: true,
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
    nullable: true,
  })
  salt?: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: true,
  })
  @Exclude()
  password?: string;

  @IsNotEmpty()
  @IsEnum(Role)
  @Column({ type: "varchar", length: 10 })
  roles: string = Role.User;

  @IsNotEmpty()
  @IsEnum(UserStatus)
  @Column({ type: "varchar", length: 10 })
  status: string = UserStatus.Pending;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Exclude()
  googleId?: string;


  @IsString()
  @Column({ type: "varchar", length: 500, nullable: true })
  accessToken?: string;

  @IsString()
  @Column({ type: "varchar", length: 500, nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts?: Post[];
}
