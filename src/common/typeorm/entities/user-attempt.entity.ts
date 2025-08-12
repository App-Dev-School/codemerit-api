import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Option } from './option.entity';
import { Question } from './question.entity';

@Entity()
export class UserAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (trivia) => trivia.id)
  trivia: Question;

  @ManyToMany(() => Option)
  @JoinTable()
  selectedOptions: Option[];

  @Column({ default: false })
  isCorrect: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  attemptedAt: Date;
}
