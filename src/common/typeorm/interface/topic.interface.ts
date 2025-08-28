import { TopicLabel } from 'src/common/enum/TopicLabel.enum';

export interface ITopic {
  id: number;
  title: string;
  subjectId: number;
  image: string;
  label: TopicLabel;
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
