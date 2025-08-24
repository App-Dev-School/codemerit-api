import { QuestionTopicResponseDto } from './question-topic-response.dto';

export class AdminQuestionResponseDto {
  id: number;
  question: string;
  subjectId: number;
  subject: string;
  topics: QuestionTopicResponseDto[];
  status: string;
  level: string;
  slug: string;
  questionType: string;
  createdByUsername: string;
  createdByName: string;
}
