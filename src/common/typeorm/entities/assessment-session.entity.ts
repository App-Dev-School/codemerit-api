import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { AuditEntity } from './audit.entity';
import { Subject } from './subject.entity';
import { Topic } from './topic.entity';
import { IAssessmentSession } from '../interface/assessment-session.interface';
import { SkillRating } from './skill-rating.entity';
import { User } from './user.entity';

@Entity()
export class AssessmentSession
  extends AbstractEntity
  implements IAssessmentSession
{
  @Column({
    type: 'integer',
    nullable: false,
    default: null,
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
