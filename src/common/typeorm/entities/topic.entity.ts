import { Entity, Column, ManyToOne, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ITopic } from '../interface/topic.interface';
import { Subject } from './subject.entity';
import { LabelEnum } from 'src/common/enum/label.enum';

@Entity()
export class Topic extends AbstractEntity implements ITopic {
  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'integer',
    name: 'subject_id',
    nullable: false,
  })
  subjectId: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  image: string;

  @Column({
    type: 'enum',
    enum: LabelEnum,
    nullable: true,
  })
  label: LabelEnum;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: null,
  })
  color: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  order: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  parent?: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  isPublished: boolean;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  goal: string;

  @Column({
    type: 'int',
    default: 0,
  })
  numVotes: number;

  @Column({
    type: 'int',
    default: 0,
  })
  numLessons: number;

  @Column({
    type: 'int',
    default: 0,
  })
  numQuestions: number;

  @Column({
    type: 'int',
    default: 0,
  })
  numTrivia: number;

  @Column({
    type: 'int',
    default: 0,
  })
  numQuizzes: number;

  // @ManyToOne(() => Subject, { eager: true })
  // @JoinColumn({ name: 'subject_id', referencedColumnName: 'id' })
  // subject: Subject;
@ManyToOne(() => Subject)
@JoinColumn({ name: 'subject_id' })
subject: Subject;

// @ManyToOne(() => Topic)
// @JoinColumn({ name: 'parent' })
// topic: Topic;

  @ManyToOne(() => Topic, topic => topic.subTopics, { nullable: true })
  @JoinColumn({ name: 'parent' })
  parentTopic?: Topic;


  @OneToMany(() => Topic, topic => topic.parentTopic)
  subTopics: Topic[];
}