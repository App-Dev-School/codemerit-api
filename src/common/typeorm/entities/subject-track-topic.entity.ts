import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Topic } from './topic.entity';
import { SubjectTrack } from './subject-track.entity';

@Unique(['subjectTrackId', 'topicId'])
@Entity()
export class SubjectTrackTopic extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  subjectTrackId: number;

  @Column({ type: 'integer', nullable: false })
  topicId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => SubjectTrack, (st) => st.subjectTrackTopics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectTrackId' })
  subjectTrack: SubjectTrack;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;
}
