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
import { IQuizTopic } from '../interface/quiz-topic.interface';

@Entity()
export class QuizTopic extends AbstractEntity implements IQuizTopic {
  @Column({
    type: 'integer',
    nullable: false,
  })
  topicId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  quizId: number;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quizId', referencedColumnName: 'id' })
  quiz: Quiz;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId', referencedColumnName: 'id' })
  topic: Topic;
}
