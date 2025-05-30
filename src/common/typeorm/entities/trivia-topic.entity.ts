import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Trivia } from './trivia.entity';
import { ITriviaTopic } from '../interface/trivia-topic.interface';
import { Topic } from './topic.entity';

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

  @ManyToOne(() => Topic, { eager: true })
  @JoinColumn({ name: 'topicId', referencedColumnName: 'id' })
  topic: Topic;

  // @ManyToOne(() => Trivia, { eager: true })
  // @JoinColumn({ name: 'triviaId', referencedColumnName: 'id' })
  // trivia: Trivia;
}
