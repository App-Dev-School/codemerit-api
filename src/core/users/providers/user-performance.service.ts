import { Injectable } from '@nestjs/common';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UserPerformanceService {
  constructor(private dataSource: DataSource) {}

  /**
   * Get user performance stats.
   * - If userId is passed → single user
   * - If fullData = true → include subject-wise breakdown
   * - If showTrend = true → include trend analytics
   */
  async getUserPerformance(userId?: number, fullData = false, showTrend = false) {
    const latestAttemptSub = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select('qa2.userId', 'userId')
      .addSelect('qa2.questionId', 'questionId')
      .addSelect('MAX(qa2.id)', 'maxId')
      .from(QuestionAttempt, 'qa2')
      .groupBy('qa2.userId')
      .addGroupBy('qa2.questionId')
      .getQuery();

    // ----------------------
    // 1. Overall stats
    // ----------------------
    const overallQb = this.dataSource
      .createQueryBuilder()
      .from(User, 'u')
      .leftJoin(`(${latestAttemptSub})`, 'la', 'la.userId = u.id')
      .leftJoin(QuestionAttempt, 'qa', 'qa.id = la.maxId')
      .leftJoin('question', 'q', 'q.id = qa.questionId');

    overallQb
      .select('u.id', 'userId')
      .addSelect('u.firstName', 'firstName')
      .addSelect('u.lastName', 'lastName')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(qa.id)', 'numTotalAttempts')
      .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numTotalCorrectAttempts')
      .addSelect(
        'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
        'numTotalWrongAttempts'
      )
      .addSelect('SUM(CASE WHEN qa.isSkipped = 1 THEN 1 ELSE 0 END)', 'numTotalSkipped')
      // level wise
      .addSelect('SUM(CASE WHEN q.level = :easy THEN 1 ELSE 0 END)', 'numEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium THEN 1 ELSE 0 END)', 'numMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard THEN 1 ELSE 0 END)', 'numHard')
      .addSelect('SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectHard')
      .addSelect('SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongHard')
      .groupBy('u.id')
      .setParameter('easy', DifficultyLevelEnum.Easy)
      .setParameter('medium', DifficultyLevelEnum.Intermediate)
      .setParameter('hard', DifficultyLevelEnum.Advanced);

    if (userId) overallQb.where('u.id = :userId', { userId });

    const overallRow = await overallQb.getRawOne(); // fetch only one row if userId is passed

    if (!overallRow) return null;

    const overallData = this.mapOverall(overallRow);

    if (!fullData) {
      if (showTrend && userId) {
        overallData['trends'] = await this.getUserTrends(userId);
      }
      return overallData;
    }

    // ----------------------
    // 2. Subject-wise stats
    // ----------------------
    const subjectQb = this.dataSource
      .createQueryBuilder()
      .from(User, 'u')
      .leftJoin(`(${latestAttemptSub})`, 'la', 'la.userId = u.id')
      .leftJoin(QuestionAttempt, 'qa', 'qa.id = la.maxId')
      .leftJoin('question', 'q', 'q.id = qa.questionId')
      .leftJoin('subject', 's', 's.id = q.subjectId');

    subjectQb
      .select('u.id', 'userId')
      .addSelect('s.id', 'subjectId')
      .addSelect('s.title', 'subjectTitle')
      .addSelect('COUNT(qa.id)', 'numAttempts')
      .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectAttempts')
      .addSelect(
        'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
        'numWrongAttempts'
      )
      .addSelect('SUM(CASE WHEN qa.isSkipped = 1 THEN 1 ELSE 0 END)', 'numSkipped')
      // difficulty-level splits
      .addSelect('SUM(CASE WHEN q.level = :easy THEN 1 ELSE 0 END)', 'numEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium THEN 1 ELSE 0 END)', 'numMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard THEN 1 ELSE 0 END)', 'numHard')
      .addSelect('SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'numCorrectHard')
      .addSelect('SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongEasy')
      .addSelect('SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongMedium')
      .addSelect('SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 0 THEN 1 ELSE 0 END)', 'numWrongHard')
      .groupBy('u.id')
      .addGroupBy('s.id')
      .setParameter('easy', DifficultyLevelEnum.Easy)
      .setParameter('medium', DifficultyLevelEnum.Intermediate)
      .setParameter('hard', DifficultyLevelEnum.Advanced);

    if (userId) subjectQb.where('u.id = :userId', { userId });

    const subjectRows = await subjectQb.getRawMany();

    const subjects = subjectRows.map(this.mapSubject);
    overallData['subjects'] = subjects;

    if (showTrend && userId) {
      overallData['trends'] = await this.getUserTrends(userId);
    }

    return overallData;
  }

  // ----------------------
  // Mapper functions
  // ----------------------
  private mapOverall = (row: any) => {
    const numCorrect = +row.numTotalCorrectAttempts || 0;
    const numWrong = +row.numTotalWrongAttempts || 0;
    const numAttempts = +row.numTotalAttempts || 0;
    const rawScore = numAttempts > 0 ? ((numCorrect - 0.2 * numWrong) / numAttempts) * 100 : 0;
    const score = Math.max(0, Math.min(100, rawScore));
    const accuracy = numAttempts > 0 ? (numCorrect / numAttempts) * 100 : 0;
    const level = this.getUserLevel(+row.numEasy, +row.numMedium, +row.numHard);
    return {
      userId: row.userId,
      name: row.firstName + ' ' + row.lastName,
      email: row.email,
      overall: {
        numTotalAttempts: numAttempts,
        numTotalCorrectAttempts: numCorrect,
        numTotalWrongAttempts: numWrong,
        numTotalSkipped: +row.numTotalSkipped || 0,
        numEasy: +row.numEasy || 0,
        numMedium: +row.numMedium || 0,
        numHard: +row.numHard || 0,
        numCorrectEasy: +row.numCorrectEasy || 0,
        numCorrectMedium: +row.numCorrectMedium || 0,
        numCorrectHard: +row.numCorrectHard || 0,
        numWrongEasy: +row.numWrongEasy || 0,
        numWrongMedium: +row.numWrongMedium || 0,
        numWrongHard: +row.numWrongHard || 0,
        score: +score.toFixed(1),
        accuracy: +accuracy.toFixed(1),
        efficiency: +accuracy.toFixed(1),
        userLevel: level,
        feedback: this.getFeedback(level, score, accuracy),
      },
    };
  };

  private mapSubject = (row: any) => {
    const numCorrect = +row.numCorrectAttempts || 0;
    const numWrong = +row.numWrongAttempts || 0;
    const numAttempts = +row.numAttempts || 0;
    const rawScore = numAttempts > 0 ? ((numCorrect - 0.2 * numWrong) / numAttempts) * 100 : 0;
    const score = Math.max(0, Math.min(100, rawScore));
    const accuracy = numAttempts > 0 ? (numCorrect / numAttempts) * 100 : 0;
    const level = this.getUserLevel(+row.numEasy, +row.numMedium, +row.numHard);

    return {
      subjectId: row.subjectId,
      subjectTitle: row.subjectTitle,
      numAttempts,
      numCorrectAttempts: numCorrect,
      numWrongAttempts: numWrong,
      numSkipped: +row.numSkipped || 0,
      numEasy: +row.numEasy || 0,
      numMedium: +row.numMedium || 0,
      numHard: +row.numHard || 0,
      numCorrectEasy: +row.numCorrectEasy || 0,
      numCorrectMedium: +row.numCorrectMedium || 0,
      numCorrectHard: +row.numCorrectHard || 0,
      numWrongEasy: +row.numWrongEasy || 0,
      numWrongMedium: +row.numWrongMedium || 0,
      numWrongHard: +row.numWrongHard || 0,
      score: +score.toFixed(1),
      accuracy: +accuracy.toFixed(1),
      efficiency: +accuracy.toFixed(1),
      userLevel: level,
      feedback: this.getFeedback(level, score, accuracy),
    };
  };

  // ----------------------
  // Helpers
  // ----------------------
  private getUserLevel(numEasy: number, numMedium: number, numHard: number): string {
    const max = Math.max(numEasy, numMedium, numHard);
    if (max === 0) return 'Unclassified';
    if (max === numHard) return 'Advanced';
    if (max === numMedium) return 'Intermediate';
    return 'Beginner';
  }

  private getFeedback(level: string, score: number, accuracy: number): string {
    if (level === 'Unclassified') return 'Not enough data to classify';
    return `${level} level performance. Score: ${score.toFixed(1)}%, Accuracy: ${accuracy.toFixed(1)}%`;
  }

  private async getUserTrends(userId: number) {
  // Fetch attempts for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attempts = await this.dataSource
    .getRepository(QuestionAttempt)
    .createQueryBuilder('qa')
    .where('qa.userId = :userId', { userId })
    .andWhere('qa.createdAt >= :date', { date: thirtyDaysAgo.toISOString() })
    .orderBy('qa.createdAt', 'ASC')
    .getMany();

  if (!attempts.length) return [];

  // Aggregate by date
  const trendsMap: Record<string, { numAttempts: number; numCorrect: number; numWrong: number }> = {};

  for (const attempt of attempts) {
    const dateKey = attempt.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!trendsMap[dateKey]) trendsMap[dateKey] = { numAttempts: 0, numCorrect: 0, numWrong: 0 };

    trendsMap[dateKey].numAttempts += 1;
    if (attempt.isCorrect) trendsMap[dateKey].numCorrect += 1;
    else if (!attempt.isCorrect && attempt.selectedOption !== null) trendsMap[dateKey].numWrong += 1;
  }

  // Convert to array with calculated score and accuracy
  const trendsArray = Object.entries(trendsMap).map(([date, stats]) => {
    const score = stats.numAttempts > 0 ? ((stats.numCorrect - 0.2 * stats.numWrong) / stats.numAttempts) * 100 : 0;
    const accuracy = stats.numAttempts > 0 ? (stats.numCorrect / stats.numAttempts) * 100 : 0;
    return {
      date,
      numAttempts: stats.numAttempts,
      numCorrect: stats.numCorrect,
      numWrong: stats.numWrong,
      score: +Math.max(0, Math.min(100, score)).toFixed(1),
      accuracy: +accuracy.toFixed(1),
    };
  });

  return trendsArray;
}

}