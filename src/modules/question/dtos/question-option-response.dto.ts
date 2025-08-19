export class QuestionOptionResponseDto {
  id: number;
  questionId: number;
  option: string;
  correct: boolean;
  comment?: string;
}
