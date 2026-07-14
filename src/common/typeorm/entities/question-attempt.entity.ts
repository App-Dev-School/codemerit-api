import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn
} from 'typeorm';
import { IQuestionAttempt } from '../interface/question-attempt.interface';
import { AbstractEntity } from './abstract.entity';
import { QuestionOption } from './question-option.entity';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Quiz } from './quiz.entity';

// Speeds up the "latest attempt per question for a user" queries used throughout
// subject/topic/subject-track stats (WHERE userId = ? GROUP BY questionId) —
// without it MySQL falls back to a filesort/temp table for the GROUP BY.
@Index(['userId', 'questionId'])
// Speeds up mastery-leaderboard queries (MeritService), which scan ALL users
// scoped by question — the index above doesn't help there since it doesn't bind
// userId up front. questionId-leading lets MySQL drive from the (small) question
// set for a subject/track and index-only-lookup matching attempts.
@Index(['questionId', 'isCorrect', 'userId'])
@Entity()
export class QuestionAttempt extends AbstractEntity implements IQuestionAttempt {

  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  questionId: number;

  @Column({ type: 'int', nullable: true })
  quizId: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  selectedOption: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: 0
  })
  timeTaken: number;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isSkipped: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  hintUsed: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isCorrect: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  answer?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => QuestionOption)
  @JoinColumn({ name: 'selectedOption', referencedColumnName: 'id' })
  selectedOptionDetails: QuestionOption;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId', referencedColumnName: 'id' })
  question: Question;

  @ManyToOne(() => Quiz, (quiz) => quiz.questionAttempts)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;
}