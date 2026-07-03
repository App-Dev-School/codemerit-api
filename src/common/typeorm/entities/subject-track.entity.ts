import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Subject } from './subject.entity';
import { SubjectTrackTopic } from './subject-track-topic.entity';

@Unique(['subjectId', 'title'])
@Entity()
export class SubjectTrack extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  subjectId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true, default: null })
  slug: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => Subject, (subject) => subject.subjectTracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @OneToMany(() => SubjectTrackTopic, (stt) => stt.subjectTrack)
  subjectTrackTopics: SubjectTrackTopic[];
}
