import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn
} from 'typeorm';
import { IQuestionAttempt } from '../interface/question-attempt.interface';
import { AbstractEntity } from './abstract.entity';
import { QuestionOption } from './question-option.entity';
import { Question } from './question.entity';
import { User } from './user.entity';

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


  @Column({
    type: 'integer',
    nullable: false,
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
}