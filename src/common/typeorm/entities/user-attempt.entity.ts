import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { QuestionOption } from './question-option.entity';
import { Question } from './question.entity';

@Entity()
export class UserAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.id)
  question: Question;

  @ManyToMany(() => QuestionOption)
  @JoinTable()
  selectedOptions: QuestionOption[];

  @Column({ default: false })
  isCorrect: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  attemptedAt: Date;
}
