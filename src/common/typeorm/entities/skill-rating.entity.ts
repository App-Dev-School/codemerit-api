import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ISkillRating } from '../interface/skill-rating.interface';
import { AbstractEntity } from './abstract.entity';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';
import { AuditEntity } from './audit.entity';
import { AssessmentSession } from './assessment-session.entity';

@Entity()
export class SkillRating extends AbstractEntity implements ISkillRating {
  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  skillId: number;

  @Column({
    type: 'enum',
    enum: SkillTypeEnum,
    default: SkillTypeEnum.SUBJECT,
  })
  skillType: SkillTypeEnum;

  @Column({
    type: 'integer',
    nullable: false,
    default: null,
  })
  rating: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: null,
  })
  assessmentSessionId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => AssessmentSession, (session) => session.skillRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentSessionId' })
  assessmentSession: AssessmentSession;
}
