import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ITopic } from '../interface/topic.interface';
import { Subject } from './subject.entity';
import { AuditEntity } from './audit.entity';
import { TopicLabel } from 'src/common/enum/TopicLabel.enum';

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
    name: 'subjectId',
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
    enum: TopicLabel,
    nullable: true,
    default: TopicLabel.Beginner
  })
  label: TopicLabel;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: null,
  })
  shortDesc: string;

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
    type: 'int',
    nullable: false,
  })
  weight: number;

  @Column({
    type: 'int',
    nullable: true,
    default: 1
  })
  popularity: number;

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
  votes: number;

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

  @Column((type) => AuditEntity)
  audit: AuditEntity;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne(() => Topic, (topic) => topic.subTopics, { nullable: true })
  @JoinColumn({ name: 'parent' })
  parentTopic?: Topic;

  @OneToMany(() => Topic, (topic) => topic.parentTopic)
  subTopics: Topic[];
}
