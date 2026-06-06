import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';

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
  category: string;
  level: DifficultyLevelEnum;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
