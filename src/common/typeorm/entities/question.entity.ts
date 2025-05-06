import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IQuestion } from '../interface/question.interface';
import { LavelEnum } from 'src/common/enum/lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { Topic } from './topic.entity';
import { Subject } from './subject.entity';

('Easy|Intermediate|Advanced');
@Entity()
export class Question extends AbstractEntity implements IQuestion {
  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ type: 'integer', name: 'topic_id', nullable: false })
  topicId: number;

  @Column({ type: 'integer', name: 'subject_id', nullable: false })
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

  @Column({
    type: 'enum',
    enum: LavelEnum,
    nullable: true,
  })
  level: LavelEnum;

  @Column({ type: 'int', default: 1 })
  marks: number;

  @Column({ type: 'varchar', length: 255, unique: true })
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

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subject_id', referencedColumnName: 'id' })
  subject: Subject;

  @ManyToOne(() => Topic, { eager: true })
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  topic: Topic;
}
