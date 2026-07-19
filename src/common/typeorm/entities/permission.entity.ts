import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';
import { IPermission } from '../interface/permission.interface';

@Entity()
export class Permission implements IPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permission: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  group: string;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  // Whether users can see this in their self-service request list and request it
  // (with a comment) rather than only being granted it directly by an admin.
  @Column({ type: 'boolean', default: false })
  isRequestable: boolean;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
