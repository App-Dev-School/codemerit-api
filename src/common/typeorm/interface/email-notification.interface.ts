import { User } from '../entities/user.entity';

export interface IEmailNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  dataId: number;
  dataTitle: string;
  isRead: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  user?: User;
}
