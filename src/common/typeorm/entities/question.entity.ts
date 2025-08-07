import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DifficultyLevelEnum } from 'src/common/enum/lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { Subject } from './subject.entity';
import { IQuestion } from '../interface/question.interface';
import { AuditEntity } from './audit.entity';
import { QuestionType } from 'src/common/enum/questionType';
import { QuestionStatus } from 'src/common/enum/questionStatus.enum';

@Entity()
export class Question extends AbstractEntity implements IQuestion {
  @Column({ type: 'text', nullable: true, default: '' })
  title: string;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({
    type: 'integer',
    name: 'subjectId',
    nullable: false,
  })
  subjectId: number;

  @Column({ type: 'enum', 
     nullable: false,
    enum: QuestionType,
    default: QuestionType.General,
 })
  questionType: QuestionType;

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
    length: 255,
    unique: true,
    nullable: true,
    default: null,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: LabelEnum,
    nullable: true,
    default: LabelEnum.General,
  })
  label: LabelEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string;

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    nullable: false,
    default: QuestionStatus.Pending,
  })
  status: QuestionStatus;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'text', nullable: true })
  hint: string;

  @Column({
    type: 'int',
    nullable: true,
    default: 0
  })
  order: number;

  @Column((type) => AuditEntity)
  audit: AuditEntity;

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;
}
