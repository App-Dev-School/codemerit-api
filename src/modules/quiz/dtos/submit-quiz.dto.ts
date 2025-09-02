import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';

export class UpdateQuizDto {
    quizId: string;
    quizName: string;
    userId: string;
    userFullName: string;
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
    score: number;
    dateAttempted: Date;
    attempts: [
        {
            questionId: 1,
            selectedChoice: string,
            correctAnswer: string,
            isCorrect: true,
            usedHint: false
        },
    ]
}
