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
  permission: string; // e.g. 'CanAddQuestion'

  @Column()
  description: string;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
