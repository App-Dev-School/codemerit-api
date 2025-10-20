import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';

export interface IQuiz {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  slug: string;
  quizType: QuizTypeEnum;
  image: string;
  label: TopicLabelEnum;
  isPublished: boolean;
  goal: string;
  tag: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
