import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';

export interface ITopic {
  id: number;
  title: string;
  subjectId: number;
  image: string;
  label: TopicLabelEnum;
  order: number;
  parent?: number;
  isPublished: boolean;
  description: string;
  weight: number;
  goal: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}
