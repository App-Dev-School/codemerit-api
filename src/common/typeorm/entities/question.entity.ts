import { IsEnum } from 'class-validator';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn
} from 'typeorm';
import { IQuestion } from '../interface/question.interface';
import { AbstractEntity } from './abstract.entity';
import { QuestionTopic } from './quesion-topic.entity';
import { QuestionOption } from './question-option.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';

@Entity()
export class Question extends AbstractEntity implements IQuestion {
  @Column({ type: 'text', nullable: true, default: null })
  title: string;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({
    type: 'integer',
    name: 'subjectId',
    nullable: false,
  })
  subjectId: number;

  @Column({
    type: 'enum',
    nullable: false,
    enum: QuestionTypeEnum,
    default: QuestionTypeEnum.General,
  })
  @IsEnum(QuestionTypeEnum, { message: 'Invalid question type' })
  questionType: QuestionTypeEnum;
  //implement related validations for questionType
  //if questionType == General, then no options are required
  //if questionType == Trivia, then options are required

  @Column({
    type: 'enum',
    enum: DifficultyLevelEnum,
    nullable: true,
  })
  @IsEnum(DifficultyLevelEnum, { message: 'Enter question level' })
  level: DifficultyLevelEnum;

  @Column({ type: 'int', default: 1 })
  marks: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
    default: null,
  })
  slug: string;
  //slugify and limit max character to 50

  @Column({
    type: 'int',
    default: 60,
  })
  timeAllowed: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string;

  @Column({
    type: 'enum',
    enum: QuestionStatusEnum,
    nullable: false,
    default: QuestionStatusEnum.Pending,
  })
  @IsEnum(QuestionStatusEnum, { message: 'Enter question status' })
  status: QuestionStatusEnum;
  //fetched questions for users (non-admin) should have status = Active

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'text', nullable: true })
  hint: string;

  @Column({
    type: 'int',
    default: 1,
  })
  orderId: number;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;

  @OneToMany(() => QuestionTopic, (questionTopic) => questionTopic.question, {})
  questionTopics: QuestionTopic[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  userCreatedBy: User;

  @OneToMany(() => QuestionOption, (option) => option.question)
  options: QuestionOption[];
}
