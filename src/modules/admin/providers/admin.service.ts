// src/modules/admin/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Question)
        private readonly questionRepo: Repository<Question>,

        @InjectRepository(Topic)
        private readonly topicRepo: Repository<Topic>,

        @InjectRepository(Subject)
        private readonly subjectRepo: Repository<Subject>,

        @InjectRepository(QuestionAttempt)
        private readonly attemptRepo: Repository<QuestionAttempt>,

        @InjectRepository(Quiz)
        private readonly quizRepo: Repository<Quiz>,

        @InjectRepository(QuizResult)
        private readonly quizResultRepo: Repository<QuizResult>,
    ) { }

    async getDashboardSummary() {
        const [attempts, questions, users, topics, subjects, quizzes, timeSeries] = await Promise.all([
            this.getAttemptStats(),
            this.getQuestionStats(),
            this.getUserStats(),
            this.getTopicStats(),
            this.getSubjectStats(),
            this.getQuizStats(),
            this.getTimeSeriesStats(),
        ]);

        return {
                attempts,
                questions,
                users,
                topics,
                subjects,
                quizzes,
                timeSeries,
        };
    }

    // ------------------- ATTEMPT METRICS -------------------
    private async getAttemptStats() {
        const result = await this.attemptRepo
            .createQueryBuilder('a')
            .select([
                'COUNT(a.id) as total',
                'SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as totalCorrect',
                'SUM(CASE WHEN a.isCorrect = 0 AND a.selectedOption IS NOT NULL THEN 1 ELSE 0 END) as totalWrong',
                'SUM(CASE WHEN a.selectedOption IS NULL THEN 1 ELSE 0 END) as totalSkipped',
                'COUNT(DISTINCT a.userId) as distinctUsers',
            ])
            .getRawOne();

        return {
            total: +result.total || 0,
            totalCorrect: +result.totalCorrect || 0,
            totalWrong: +result.totalWrong || 0,
            totalSkipped: +result.totalSkipped || 0,
            distinctUsers: +result.distinctUsers || 0,
        };
    }

    // ------------------- QUESTION METRICS -------------------
    private async getQuestionStats() {
        const result = await this.questionRepo
            .createQueryBuilder('q')
            .select([
                'COUNT(q.id) as total',
                `SUM(CASE WHEN q.questionType = :trivia THEN 1 ELSE 0 END) as totalTrivia`,
                `SUM(CASE WHEN q.questionType = :general THEN 1 ELSE 0 END) as totalGeneral`,
                `SUM(CASE WHEN q.questionType = :trivia AND q.status = :active THEN 1 ELSE 0 END) as totalTriviaActive`,
                `SUM(CASE WHEN q.questionType = :general AND q.status = :active THEN 1 ELSE 0 END) as totalGeneralActive`,
                `SUM(CASE WHEN q.questionType = :trivia AND q.status = :pending THEN 1 ELSE 0 END) as totalTriviaPending`,
                `SUM(CASE WHEN q.questionType = :general AND q.status = :pending THEN 1 ELSE 0 END) as totalGeneralPending`,
            ])
            .setParameters({
                trivia: QuestionTypeEnum.Trivia,
                general: QuestionTypeEnum.General,
                active: QuestionStatusEnum.Active,
                pending: QuestionStatusEnum.Pending,
            })
            .getRawOne();

        return {
            total: +result.total || 0,
            totalTrivia: +result.totalTrivia || 0,
            totalGeneral: +result.totalGeneral || 0,
            totalTriviaActive: +result.totalTriviaActive || 0,
            totalGeneralActive: +result.totalGeneralActive || 0,
            totalTriviaPending: +result.totalTriviaPending || 0,
            totalGeneralPending: +result.totalGeneralPending || 0,
        };
    }

    // ------------------- USER METRICS -------------------
    private async getUserStats() {
        const result = await this.userRepo
            .createQueryBuilder('u')
            .select([
                'COUNT(u.id) as total',
                `SUM(CASE WHEN u.accountStatus = :active THEN 1 ELSE 0 END) as totalActive`,
                `SUM(CASE WHEN u.accountStatus = :pending THEN 1 ELSE 0 END) as totalPending`,
                `SUM(CASE WHEN u.accountStatus = :blocked THEN 1 ELSE 0 END) as totalBlocked`,
                `SUM(CASE WHEN u.designation IS NOT NULL AND u.designation > 0 THEN 1 ELSE 0 END) as totalWithDesignation`,
                `SUM(CASE WHEN u.role = :manager THEN 1 ELSE 0 END) as totalModerators`,
            ])
            .setParameters({
                active: AccountStatusEnum.ACTIVE,
                pending: AccountStatusEnum.PENDING,
                blocked: AccountStatusEnum.BLOCKED,
                manager: UserRoleEnum.MODERATOR,
            })
            .getRawOne();

        return {
            total: +result.total || 0,
            totalActive: +result.totalActive || 0,
            totalPending: +result.totalPending || 0,
            totalBlocked: +result.totalBlocked || 0,
            totalWithDesignation: +result.totalWithDesignation || 0,
            totalModerators: +result.totalModerators || 0,
        };
    }

    // ------------------- TOPIC METRICS -------------------
    private async getTopicStats() {
        const result = await this.topicRepo
            .createQueryBuilder('t')
            .select([
                'COUNT(t.id) as total',
                `SUM(CASE WHEN t.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
                `SUM(CASE WHEN t.isPublished = false THEN 1 ELSE 0 END) as totalPending`,
            ])
            .getRawOne();

        return {
            total: +result.total || 0,
            totalActive: +result.totalActive || 0,
            totalPending: +result.totalPending || 0,
        };
    }

    // ------------------- SUBJECT METRICS -------------------
    private async getSubjectStats() {
        const result = await this.subjectRepo
            .createQueryBuilder('s')
            .select([
                'COUNT(s.id) as total',
                `SUM(CASE WHEN s.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
                `SUM(CASE WHEN s.isPublished = false THEN 1 ELSE 0 END) as totalInactive`,
            ])
            .getRawOne();

        return {
            total: +result.total || 0,
            totalActive: +result.totalActive || 0,
            totalInactive: +result.totalInactive || 0,
        };
    }

    // ------------------- QUIZ METRICS -------------------
    private async getQuizStats() {
        // 1️⃣ Basic quiz counts
        const baseStats = await this.quizRepo
            .createQueryBuilder('qz')
            .select([
                'COUNT(qz.id) as total',
                `SUM(CASE WHEN qz.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
                `SUM(CASE WHEN qz.isPublished = false THEN 1 ELSE 0 END) as totalInactive`,
                // Additional: count how many have been played at least once
                `SUM(
        CASE WHEN EXISTS (
          SELECT 1 FROM quiz_result qr WHERE qr.quizId = qz.id
        ) THEN 1 ELSE 0 END
      ) as playedQuizzes`,
            ])
            .getRawOne();

        // 2️⃣ Total plays (quiz results count)
        const totalPlaysResult = await this.quizResultRepo
            .createQueryBuilder('qr')
            .select('COUNT(qr.id)', 'totalPlays')
            .getRawOne();

        // 3️⃣ Average score (if recorded)
        const avgScoreResult = await this.quizResultRepo
            .createQueryBuilder('qr')
            .select('AVG(qr.score)', 'avgScore')
            .getRawOne();

        // Extract and normalize values
        const total = +baseStats.total || 0;
        const totalActive = +baseStats.totalActive || 0;
        const totalInactive = +baseStats.totalInactive || 0;
        const playedQuizzes = +baseStats.playedQuizzes || 0;
        const totalPlays = +totalPlaysResult.totalPlays || 0;
        const avgScore = +avgScoreResult.avgScore || 0;

        const avgPlaysPerQuiz =
            playedQuizzes > 0 ? +(totalPlays / playedQuizzes).toFixed(2) : 0;

        // 4️⃣ Return unified response
        return {
            total,
            totalActive,
            totalInactive,
            playedQuizzes,
            totalPlays,
            avgPlaysPerQuiz,
            avgScore,
        };
    }


    // ------------------- TIME SERIES (DAILY + WEEKLY) -------------------
    // ------------------- TIME SERIES (DAILY + WEEKLY) -------------------
    private async getTimeSeriesStats() {
        // Limits
        const dailyLimit = 30;
        const weeklyLimit = 8;

        const now = new Date();
        // End of today (to include today's rows)
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        // Start date for daily: 29 days ago at 00:00:00 (so inclusive of last 30 days)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - (dailyLimit - 1)); // e.g., if dailyLimit=30, subtract 29
        startDate.setHours(0, 0, 0, 0);

        // Start date for weekly: (weeklyLimit - 1) * 7 days ago, start of that day
        const startWeekDate = new Date(now);
        startWeekDate.setDate(now.getDate() - 7 * (weeklyLimit - 1));
        startWeekDate.setHours(0, 0, 0, 0);

        // Helper: daily query builder factory (filters last `dailyLimit` days)
        const dailySeries = (repo: Repository<any>, alias: string) =>
            repo
                .createQueryBuilder(alias)
                .select([`DATE(${alias}.createdAt) as date`, `COUNT(${alias}.id) as count`])
                .where(`${alias}.createdAt BETWEEN :startDate AND :endDate`, { startDate, endDate })
                .groupBy(`DATE(${alias}.createdAt)`)
                .orderBy(`DATE(${alias}.createdAt)`, 'ASC') // chronological
                .getRawMany();

        // Helper: weekly query builder factory (filters rows starting from startWeekDate)
        // Using YEAR() and WEEK(...,1) pairs to form week buckets (MySQL-style). Works in MySQL.
        // For Postgres, replace YEAR/WEEK with EXTRACT(YEAR FROM ...) / EXTRACT(WEEK FROM ...)
        const weeklySeries = (repo: Repository<any>, alias: string) =>
            repo
                .createQueryBuilder(alias)
                .select([
                    `YEAR(${alias}.createdAt) as year`,
                    `WEEK(${alias}.createdAt, 1) as week`, // ISO week (Monday start)
                    `COUNT(${alias}.id) as count`,
                ])
                .where(`${alias}.createdAt >= :startWeekDate`, { startWeekDate })
                // get latest weeks first, then we'll reverse to chronological order
                .groupBy(`YEAR(${alias}.createdAt)`)
                .addGroupBy(`WEEK(${alias}.createdAt, 1)`)
                .orderBy(`YEAR(${alias}.createdAt)`, 'DESC')
                .addOrderBy(`WEEK(${alias}.createdAt, 1)`, 'DESC')
                .limit(weeklyLimit)
                .getRawMany();

        // Run all 8 queries in parallel
        const [
            userDaily,
            questionDaily,
            quizDaily,
            attemptDaily,
            userWeeklyRaw,
            questionWeeklyRaw,
            quizWeeklyRaw,
            attemptWeeklyRaw,
        ] = await Promise.all([
            dailySeries(this.userRepo, 'u'),
            dailySeries(this.questionRepo, 'q'),
            dailySeries(this.quizRepo, 'qz'),
            dailySeries(this.attemptRepo, 'a'),

            weeklySeries(this.userRepo, 'u'),
            weeklySeries(this.questionRepo, 'q'),
            weeklySeries(this.quizRepo, 'qz'),
            weeklySeries(this.attemptRepo, 'a'),
        ]);

        // Convert weekly raw results (which are DESC ordered) to chronological ASC order and format week string
        const normalizeWeekly = (rows: any[]) =>
            rows
                .slice() // copy
                .reverse() // make chronological (old → new)
                .map((r) => ({
                    week: `${r.year}-W${String(r.week).padStart(2, '0')}`, // e.g. "2025-W04"
                    count: +r.count,
                }));

        // For daily, we return the DB rows (already ASC) — but those days with zero count will be missing.
        // If you want zero-filled series (rows with zero count for dates with no activity),
        // we can generate the last 30 calendar days in JS and fill them. (optional)
        const normalizeDaily = (rows: any[]) => rows.map((r) => ({ date: r.date, count: +r.count }));

        return {
            daily: {
                users: normalizeDaily(userDaily),
                questions: normalizeDaily(questionDaily),
                quizzes: normalizeDaily(quizDaily),
                attempts: normalizeDaily(attemptDaily),
            },
            weekly: {
                users: normalizeWeekly(userWeeklyRaw),
                questions: normalizeWeekly(questionWeeklyRaw),
                quizzes: normalizeWeekly(quizWeeklyRaw),
                attempts: normalizeWeekly(attemptWeeklyRaw),
            },
        };
    }
}