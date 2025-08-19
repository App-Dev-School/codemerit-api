export interface IQuestionOption {
  id: number;
  questionId: number;
  option: string;
  correct: boolean;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}
