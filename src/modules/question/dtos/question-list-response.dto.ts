import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { LabelEnum } from 'src/common/enum/label.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';

export class QuestionListResponseDto {
  id: number;
  title: string | null;
  question: string;
  subjectId: number;
  questionType: string;
  level: DifficultyLevelEnum | null;
  marks: number;
  slug: string;
  label: LabelEnum | null;
  tag: string | null;
  status: QuestionStatusEnum;
  answer: string | null;
  hint: string | null;
  order: number;
  createdAt: Date;
  subject: Subject;
  topics: Topic[];
  options: any[];
}
