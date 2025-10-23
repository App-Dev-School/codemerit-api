

export interface IAppNotification {
  id: number;
  userId: number;
  senderId: number;
  title: string;
  message: string;
  isSeen: number; // 0 = false, 1 = true
  dataId: string;
  dataTitle: string;
  createdAt: Date;
}
