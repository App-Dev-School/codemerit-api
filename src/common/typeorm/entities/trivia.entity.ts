import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DifficultyLevelEnum } from 'src/common/enum/lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { Subject } from './subject.entity';
import { ITrivia } from '../interface/trivia.interface';
import { AuditEntity } from './audit.entity';

@Entity()
export class Trivia extends AbstractEntity implements ITrivia {
  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({
    type: 'integer',
    name: 'subjectId',
    nullable: false,
  })
  subjectId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: LabelEnum,
    nullable: true,
  })
  label: LabelEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  questionType: string;

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

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'text', nullable: true })
  hint: string;

  @Column({ type: 'int', default: 0 })
  numReads: number;

  @Column({ type: 'int', default: 0 })
  numQuizzes: number;
  @Column({
    type: 'int',
    nullable: false,
  })
  order: number;

  @Column((type) => AuditEntity)
  audit: AuditEntity;

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;
}
