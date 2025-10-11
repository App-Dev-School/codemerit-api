import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permissionId: string; // e.g. 'CanAddQuestion'

  @Column()
  description: string;

  @Column()
  resourceType: string; // e.g. 'Subject' | 'Topic'

  @Column()
  resourceId: number; // e.g. 12

  @ManyToOne(() => User, user => user.permissions)
  user: User;
}
