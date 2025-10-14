import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { IUserPermission } from '../interface/user-permission.interface';

@Entity()
export class UserPermission implements IUserPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permissionId: number;

  @Column()
  resourceType?: string; // e.g. 'Subject' | 'Topic'

  @Column()
  resourceId?: number; // e.g. 12

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.permissions)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionId', referencedColumnName: 'id' })
  permission: Permission;
}
