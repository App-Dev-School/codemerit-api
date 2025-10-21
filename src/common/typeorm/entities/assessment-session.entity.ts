import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn
} from 'typeorm';
import { IAssessmentSession } from '../interface/assessment-session.interface';
import { AbstractEntity } from './abstract.entity';
import { SkillRating } from './skill-rating.entity';
import { User } from './user.entity';
import { Type } from 'class-transformer';

@Entity()
export class AssessmentSession
  extends AbstractEntity
  implements IAssessmentSession
{
  @Type(() => Number)
  @Column({
    type: 'integer',
    nullable: true,
    default: 0,
  })
  userId: number;

  @Column({ type: 'text', nullable: true, default: null })
  assessmentTitle: string;

  @Column({ type: 'text', nullable: true, default: null })
  notes?: string;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  ratedBy?: number;

  @Column({
    type: 'enum',
    enum: RatingTypeEnum,
    default: RatingTypeEnum.SELF,
  })
  ratingType: RatingTypeEnum;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @OneToMany(() => SkillRating, (rating) => rating.assessmentSession, {
    cascade: true,
    eager: true,
  })
  skillRatings: SkillRating[];

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'ratedBy', referencedColumnName: 'id' })
  rater: User;
}
