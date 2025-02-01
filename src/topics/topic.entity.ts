import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { Post } from 'src/posts/post.entity';
import { Subject } from 'src/typeorm/entities/subject.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImage?: string;

  @Column({
    type: 'number',
    nullable: true,
    default: null
  })
  subject_id: number;
  // Add the @ManyToOne relationship with the Subject entity
  @ManyToOne(() => Subject, (subject) => subject.topics)
  @JoinColumn({ name: 'subject_id' }) // Make sure the foreign key is named `subject_id`
  subject: Subject;

  // @ManyToOne(() => Subject, (subject) => subject.topics)
  // subject: Subject

    // The parentId column is a foreign key that references the id of the parent topic
    @Column({ type: 'number', nullable: true, default: null })
    parentId: number|null;
  
    // Many topics can reference one parent topic
    @ManyToOne(() => Topic, topic => topic.subtopics , { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: Topic;
  
    // A topic can have many subtopics (recursive relation)
    @OneToMany(() => Topic, topic => topic.parent)
    subtopics: Topic[];

  @ManyToMany(() => Post, (post) => post.topics, {
    onDelete: 'CASCADE',
  })
  posts: Post[];

  // https://orkhan.gitbook.io/typeorm/docs/decorator-reference
  @CreateDateColumn()
  createDate: Date;

  // @UpdateDateColumn()
  // updateDate: Date;
}