import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { IEmailNotification } from '../interface/email-notification.interface';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'email_notification_entity' })
export class EmailNotification
  extends AbstractEntity
  implements IEmailNotification
{
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  title: string;

  @Column({ type: 'text', default: '' })
  message: string;

  @Column({ type: 'int', default: 0 })
  dataId: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  dataTitle: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  notifyEmail: boolean;

  @Column({ type: 'boolean', default: false })
  notifySMS: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
