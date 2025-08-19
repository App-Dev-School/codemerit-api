import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { Subject } from './subject.entity';
import { IQuestion } from '../interface/question.interface';
import { AuditEntity } from './audit.entity';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
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
  questionType: QuestionTypeEnum;
  //implement related validations for questionType
  //if questionType == General, then no options are required
  //if questionType == Trivia, then options are required

  @Column({
    type: 'enum',
    enum: DifficultyLevelEnum,
    nullable: true,
  })
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

  // @Column({
  //   type: 'enum',
  //   enum: LabelEnum,
  //   nullable: true,
  //   default: LabelEnum.General,
  // })
  // label: LabelEnum;

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
  order: number;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  userCreatedBy: User;
}
