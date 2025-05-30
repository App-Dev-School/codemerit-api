import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { LavelEnum } from 'src/common/enum/lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { Topic } from './topic.entity';
import { Subject } from './subject.entity';
import { Option } from './option.entity';
import { TriviaOption } from './trivia-option.entity';
import { ITrivia } from '../interface/trivia.interface';

@Entity()
export class Trivia extends AbstractEntity implements ITrivia {
  @Column({ type: 'text', nullable: false })
  question: string;

  // @Column({ type: 'integer', name: 'topic_id', nullable: false })
  // topicId: number;

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

  @Column({ type: 'varchar', length: 255,unique: true , nullable: true, default: null })
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


  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subject_id', referencedColumnName: 'id' })
  subject: Subject;

  // @ManyToOne(() => Topic, { eager: true })
  // @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  // topic: Topic;
  
//   @ManyToMany(() => Topic, { eager: true })
// @JoinTable({
//   name: 'question_topic', // join table name
//   joinColumn: { name: 'question_id', referencedColumnName: 'id' },
//   inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' },
// })
// topics: Topic[];

//   @OneToMany(() => Option, option => option.question, { eager: true })
// options: Option[];
// @OneToMany(() => TriviaOption, triviaOption => triviaOption.question, { eager: true })
// triviaOptions: TriviaOption[];
}
