import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from './abstract.entity';
import { IProfile } from '../interface/profile.interface';

@Entity()
export class Profile extends AbstractEntity implements IProfile {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  linkedinUrl: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  about: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  googleId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  linkedinId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  auth_provider: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  selfRatingDone: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  playedQuiz: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  takenInterview: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  level1Assessment: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  level2Assessment: boolean;

  @Column({
    type: 'integer',
    default: null,
  })
  userId: number;

  @OneToOne((type) => User, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
