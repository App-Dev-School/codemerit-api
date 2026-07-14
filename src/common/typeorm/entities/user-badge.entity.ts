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

@Unique(['userId', 'badgeId'])
@Entity()
export class UserBadge extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  badgeId: number;

  @CreateDateColumn({ name: 'earnedAt' })
  earnedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Badge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}
