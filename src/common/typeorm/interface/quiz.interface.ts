import { TopicLabel } from 'src/common/enum/TopicLabel.enum';
import { Question } from '../entities/question.entity';

export interface IQuiz {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  slug: string;
  subjectId: number;
  quizType: string;
  image: string;
  label: TopicLabel;
  isPublished: boolean;
  goal: string;
  createdBy?: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
