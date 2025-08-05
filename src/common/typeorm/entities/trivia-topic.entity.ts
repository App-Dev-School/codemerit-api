import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ITriviaTopic } from '../interface/trivia-topic.interface';
import { Topic } from './topic.entity';
import { AuditEntity } from './audit.entity';

@Entity()
export class TriviaTopic extends AbstractEntity implements ITriviaTopic {
  @Column({
    type: 'integer',
    nullable: false,
  })
  triviaId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  topicId: number;

  @Column((type) => AuditEntity)
  audit: AuditEntity;
  @ManyToOne(() => Topic, { eager: true })
  @JoinColumn({ name: 'topicId', referencedColumnName: 'id' })
  topic: Topic;
}
