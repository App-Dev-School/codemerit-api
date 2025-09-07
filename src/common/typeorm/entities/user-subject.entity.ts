import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    Unique
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';

@Unique(['userId', 'subjectId'])
@Entity()
export class UserSubject extends AbstractEntity {
  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  subjectId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;
}