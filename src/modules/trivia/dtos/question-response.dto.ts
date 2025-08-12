import { QuestionStatus } from "src/common/enum/questionStatus.enum";
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
  status: string;
  hint: string;
  questionType: string;
  options: QuestionOptionResponseDto[];
}