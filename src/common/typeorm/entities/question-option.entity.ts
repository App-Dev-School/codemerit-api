import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IQuestionOption } from '../interface/question-option.interface';
import { AuditEntity } from './audit.entity';
import { Question } from './question.entity';

@Entity()
export class QuestionOption extends AbstractEntity implements IQuestionOption {
  @Column({ type: 'varchar', length: 100, nullable: false })
  option: string;

  @Column({ default: false })
  correct: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
    length: 200,
  })
  comment: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  questionId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId', referencedColumnName: 'id' })
  question: Question;
}
