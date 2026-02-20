import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { OrderingEnum, ModeEnum } from '../../enum/quiz-settings.enum';
import { IQuizSettings } from '../interface/quiz-settings.interface';

@Entity('quiz_settings')
export class QuizSettings implements IQuizSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numQuestions: number;

  @Column({
    type: 'enum',
    enum: OrderingEnum,
    default: OrderingEnum.DEFAULT,
  })
  ordering: OrderingEnum;

  @Column({
    type: 'enum',
    enum: ModeEnum,
    default: ModeEnum.DEFAULT,
  })
  mode: ModeEnum;

  @Column({ type: 'boolean', default: false })
  showHint: boolean;

  @Column({ type: 'boolean', default: false })
  showAnswers: boolean;

  @Column({ type: 'boolean', default: false })
  enableNavigation: boolean;

  @Column({ type: 'boolean', default: false })
  enableAudio: boolean;

  @Column({ type: 'boolean', default: false })
  enableTimer: boolean;

  @Column({ type: 'boolean', default: false })
  enableCertificate: boolean;

  @Column({ type: 'int' })
  quizId: number;

  @OneToOne(() => Quiz, (quiz) => quiz.settings)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;
}
