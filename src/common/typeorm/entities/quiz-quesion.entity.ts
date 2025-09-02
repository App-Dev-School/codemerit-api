import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Topic } from './topic.entity';
import { Question } from './question.entity';
import { IQuizQuestion } from '../interface/quiz-question.interface';
import { Quiz } from './quiz.entity';

@Entity()
export class QuizQuestion extends AbstractEntity implements IQuizQuestion {
  @Column({
    type: 'integer',
    nullable: false,
  })
  questionId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  quizId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quizId', referencedColumnName: 'id' })
  quiz: Quiz;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId', referencedColumnName: 'id' })
  question: Question;
}
