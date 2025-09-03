import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Quiz } from './quiz.entity';
import { IQuizSubject } from '../interface/quiz-subject.interface';
import { Subject } from './subject.entity';

@Entity()
export class QuizSubject extends AbstractEntity implements IQuizSubject {
  @Column({
    type: 'integer',
    nullable: false,
  })
  subjectId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  quizId: number;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quizId', referencedColumnName: 'id' })
  quiz: Quiz;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;
}
