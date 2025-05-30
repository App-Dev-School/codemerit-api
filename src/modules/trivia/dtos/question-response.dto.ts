import { QuestionOptionResponseDto } from "./question-option-response.dto";
import { QuestionTopicResponseDto } from "./question-topic-response.dto";

export class QuestionResponseDto {
  id: number;
  question: string;
  subjectId: number;
  subject: string;
  topics: QuestionTopicResponseDto[];
  level: string;
  order: number;
  marks: number;
  isPublished: boolean;
  hint: string;
  options: QuestionOptionResponseDto[];
}