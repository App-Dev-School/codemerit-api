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

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
