import { QuestionOptionResponseDto } from './question-option-response.dto';
import { QuestionTopicResponseDto } from './question-topic-response.dto';

export class QuestionResponseDto {
  id: number;
  title?: string;
  question: string;
  subjectId: number;
  subject: string;
  topics: QuestionTopicResponseDto[];
  order: number;
  marks: number;
  status: string;
  hint: string;
  questionType: string;
  options: QuestionOptionResponseDto[];
}
