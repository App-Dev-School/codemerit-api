export interface IQuestionAttempt {
    id: number;
    userId: number;
    questionId: number;
    selectedOption?: number;
    isSkipped: boolean;
    hintUsed: boolean;
    isCorrect: boolean;
    timeTaken: number;
    answer?: string;
    createdAt: Date;
    updatedAt: Date;
}
