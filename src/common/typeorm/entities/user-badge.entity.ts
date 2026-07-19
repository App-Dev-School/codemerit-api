import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Badge } from './badge.entity';
import { User } from './user.entity';
import { BadgeSourceEnum } from 'src/common/enum/badge-source.enum';

@Unique(['userId', 'badgeId'])
@Entity()
export class UserBadge extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  badgeId: number;

  @CreateDateColumn({ name: 'earnedAt' })
  earnedAt: Date;

  /** SYSTEM for auto-awarded badges; MANUAL/INTERVIEW when a person granted it. */
  @Column({ type: 'enum', enum: BadgeSourceEnum, default: BadgeSourceEnum.SYSTEM })
  source: BadgeSourceEnum;

  /** Free-form context id for the source, e.g. an Interview id — null for SYSTEM awards. */
  @Column({ type: 'int', nullable: true, default: null })
  sourceId: number | null;

  /** The user who granted this badge (an interviewer/admin) — null for SYSTEM awards. */
  @Column({ type: 'int', nullable: true, default: null })
  awardedBy: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  note: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Badge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'awardedBy' })
  awardedByUser?: User;
}
