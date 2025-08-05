import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Option } from './option.entity';
import { Trivia } from './trivia.entity';

@Entity()
export class UserAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Trivia, (trivia) => trivia.id)
  trivia: Trivia;

  @ManyToMany(() => Option)
  @JoinTable()
  selectedOptions: Option[];

  @Column({ default: false })
  isCorrect: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  attemptedAt: Date;
}
