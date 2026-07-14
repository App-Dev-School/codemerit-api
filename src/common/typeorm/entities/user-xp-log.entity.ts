import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

// One row per XP-awarding event — exists purely so period-scoped leaderboards
// (weekly/monthly) can be computed. User.points remains the fast all-time total;
// this table is only ever summed with a createdAt filter, never read in full.
@Index(['userId', 'createdAt'])
@Entity()
export class UserXpLog extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  xpAwarded: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
