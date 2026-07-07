import { Injectable } from '@nestjs/common';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { generateScore } from 'src/common/utils/common-functions';
import { DataSource } from 'typeorm';

@Injectable()
export class MeritService {
  constructor(private readonly dataSource: DataSource) {}

  // ─── Subject Merit Lists ──────────────────────────────────────────────────────

  private async computeSubjectScores(subjectIds: number[]) {
    const [triviaRows, scoreRows] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('q.subjectId', 'subjectId')
        .addSelect('COUNT(DISTINCT q.id)', 'numTrivia')
        .from('question', 'q')
        .where('q.subjectId IN (:...subjectIds)', { subjectIds })
        .andWhere('q.questionType = :trivia', { trivia: QuestionTypeEnum.Trivia })
        .andWhere('q.status = :active', { active: QuestionStatusEnum.Active })
        .groupBy('q.subjectId')
        .getRawMany(),

      this.dataSource
        .createQueryBuilder()
        .select('q.subjectId', 'subjectId')
        .addSelect('u.id', 'userId')
        .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
        .addSelect('u.username', 'username')
        .addSelect('u.image', 'image')
        .addSelect('jr.title', 'designationName')
        .addSelect('COUNT(la.questionId)', 'totalAttempts')
        .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'totalCorrect')
        .addSelect(
          'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'totalWrong',
        )
        .from(
          (subQ) =>
            subQ
              .select('qa2.userId', 'userId')
              .addSelect('qa2.questionId', 'questionId')
              .addSelect('MAX(qa2.id)', 'maxId')
              .from('question_attempt', 'qa2')
              .groupBy('qa2.userId')
              .addGroupBy('qa2.questionId'),
          'la',
        )
        .innerJoin('question_attempt', 'qa', 'qa.id = la.maxId')
        .innerJoin('user', 'u', 'u.id = la.userId')
        .leftJoin('job_role', 'jr', 'jr.id = u.designation')
        .innerJoin('question', 'q', 'q.id = la.questionId')
        .where('q.subjectId IN (:...subjectIds)', { subjectIds })
        .andWhere('q.questionType = :trivia', { trivia: QuestionTypeEnum.Trivia })
        .andWhere('q.status = :active', { active: QuestionStatusEnum.Active })
        .groupBy('q.subjectId')
        .addGroupBy('u.id')
        .getRawMany(),
    ]);

    const triviaMap = new Map<number, number>(triviaRows.map((r) => [+r.subjectId, +r.numTrivia]));
    return { triviaMap, rows: scoreRows };
  }

  async getSubjectMeritsWithRanks(
    subjectIds: number[],
    userId?: number,
    limit = 10,
  ): Promise<{ meritLists: Map<number, any[]>; userRanks: Map<number, number | null> }> {
    if (!subjectIds.length) return { meritLists: new Map(), userRanks: new Map() };

    const { triviaMap, rows } = await this.computeSubjectScores(subjectIds);

    const buckets = new Map<number, any[]>();
    for (const row of rows) {
      const subjectId = +row.subjectId;
      const numTrivia = triviaMap.get(subjectId) || 0;
      const totalAttempts = +row.totalAttempts || 0;
      const totalCorrect = +row.totalCorrect || 0;
      const totalWrong = +row.totalWrong || 0;
      const coverage = numTrivia > 0 ? (totalAttempts / numTrivia) * 100 : 0;
      const baseScore = generateScore(totalAttempts, totalCorrect, totalWrong);
      const score = +(baseScore * 0.8 + coverage * 0.2).toFixed(1);
      const accuracy = totalAttempts > 0 ? +((totalCorrect / totalAttempts) * 100).toFixed(1) : 0;
      const arr = buckets.get(subjectId) || [];
      arr.push({
        userId: +row.userId, name: row.name, username: row.username,
        image: row.image, designationName: row.designationName,
        totalAttempts, totalCorrect, totalWrong,
        accuracy, coverage: +coverage.toFixed(1), score,
      });
      buckets.set(subjectId, arr);
    }

    const meritLists = new Map<number, any[]>();
    const userRanks = new Map<number, number | null>();

    for (const [subjectId, arr] of buckets) {
      arr.sort((a, b) => b.score - a.score);
      let prev: number | null = null, rank = 0, seen = 0;
      const ranked = arr.map((m) => {
        seen++;
        if (prev === null || m.score < prev) rank = seen;
        prev = m.score;
        return { ...m, rank };
      });
      meritLists.set(subjectId, ranked.slice(0, limit));
      if (userId != null) {
        userRanks.set(subjectId, ranked.find((m) => m.userId === userId)?.rank ?? null);
      }
    }

    return { meritLists, userRanks };
  }

  // ─── SubjectTrack Merit Lists ─────────────────────────────────────────────────

  async getSubjectTrackMeritsWithRanks(
    subjectTrackIds: number[],
    userId?: number,
    limit = 10,
  ): Promise<{ meritLists: Map<number, any[]>; userRanks: Map<number, number | null> }> {
    if (!subjectTrackIds.length) return { meritLists: new Map(), userRanks: new Map() };

    const [triviaRows, scoreRows] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('stt.subjectTrackId', 'subjectTrackId')
        .addSelect('COUNT(DISTINCT q.id)', 'numTrivia')
        .from('subject_track_topic', 'stt')
        .innerJoin('question_topic', 'qt', 'qt.topicId = stt.topicId')
        .innerJoin('question', 'q', 'q.id = qt.questionId AND q.status = :active AND q.questionType = :trivia', {
          active: QuestionStatusEnum.Active, trivia: QuestionTypeEnum.Trivia,
        })
        .where('stt.subjectTrackId IN (:...subjectTrackIds)', { subjectTrackIds })
        .groupBy('stt.subjectTrackId')
        .getRawMany(),

      this.dataSource
        .createQueryBuilder()
        .select('stt.subjectTrackId', 'subjectTrackId')
        .addSelect('u.id', 'userId')
        .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
        .addSelect('u.username', 'username')
        .addSelect('u.image', 'image')
        .addSelect('jr.title', 'designationName')
        .addSelect('COUNT(DISTINCT la.questionId)', 'uniqueAttempts')
        .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'totalCorrect')
        .addSelect(
          'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'totalWrong',
        )
        .from('subject_track_topic', 'stt')
        .innerJoin('question_topic', 'qt', 'qt.topicId = stt.topicId')
        .innerJoin('question', 'q', 'q.id = qt.questionId AND q.status = :active', {
          active: QuestionStatusEnum.Active,
        })
        .innerJoin(
          (subQ) =>
            subQ
              .select('qa2.userId', 'userId')
              .addSelect('qa2.questionId', 'questionId')
              .addSelect('MAX(qa2.id)', 'maxId')
              .from('question_attempt', 'qa2')
              .groupBy('qa2.userId')
              .addGroupBy('qa2.questionId'),
          'la',
          'la.questionId = q.id',
        )
        .innerJoin('question_attempt', 'qa', 'qa.id = la.maxId')
        .innerJoin('user', 'u', 'u.id = la.userId')
        .leftJoin('job_role', 'jr', 'jr.id = u.designation')
        .where('stt.subjectTrackId IN (:...subjectTrackIds)', { subjectTrackIds })
        .groupBy('stt.subjectTrackId')
        .addGroupBy('u.id')
        .getRawMany(),
    ]);

    const triviaMap = new Map<number, number>(triviaRows.map((r) => [+r.subjectTrackId, +r.numTrivia]));

    const buckets = new Map<number, any[]>();
    for (const row of scoreRows) {
      const stId = +row.subjectTrackId;
      const numTrivia = triviaMap.get(stId) || 0;
      const uniqueAttempts = +row.uniqueAttempts || 0;
      const totalCorrect = +row.totalCorrect || 0;
      const totalWrong = +row.totalWrong || 0;
      const coverage = numTrivia > 0 ? (uniqueAttempts / numTrivia) * 100 : 0;
      const baseScore = generateScore(uniqueAttempts, totalCorrect, totalWrong);
      const score = +(baseScore * 0.8 + coverage * 0.2).toFixed(1);
      const accuracy = uniqueAttempts > 0 ? +((totalCorrect / uniqueAttempts) * 100).toFixed(1) : 0;
      const arr = buckets.get(stId) || [];
      arr.push({
        userId: +row.userId, name: row.name, username: row.username,
        image: row.image, designationName: row.designationName,
        uniqueAttempts, totalCorrect, totalWrong,
        accuracy, coverage: +coverage.toFixed(1), score,
      });
      buckets.set(stId, arr);
    }

    const meritLists = new Map<number, any[]>();
    const userRanks = new Map<number, number | null>();

    for (const [stId, arr] of buckets) {
      arr.sort((a, b) => b.score - a.score);
      let prev: number | null = null, rank = 0, seen = 0;
      const ranked = arr.map((m) => {
        seen++;
        if (prev === null || m.score < prev) rank = seen;
        prev = m.score;
        return { ...m, rank };
      });
      meritLists.set(stId, ranked.slice(0, limit));
      if (userId != null) {
        userRanks.set(stId, ranked.find((m) => m.userId === userId)?.rank ?? null);
      }
    }

    return { meritLists, userRanks };
  }

  // ─── Popular Topics ───────────────────────────────────────────────────────────

  async getPopularTopicsBySubject(subjectIds: number[], limit = 5): Promise<Map<number, any[]>> {
    if (!subjectIds.length) return new Map();

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('t.subjectId', 'subjectId')
      .addSelect('t.id', 'id')
      .addSelect('t.title', 'title')
      .addSelect('t.slug', 'slug')
      .addSelect('t.shortDesc', 'shortDesc')
      .addSelect('t.popularity', 'popularity')
      .from('topic', 't')
      .where('t.subjectId IN (:...subjectIds)', { subjectIds })
      .andWhere('t.isPublished = 1')
      .orderBy('t.subjectId')
      .addOrderBy('t.popularity', 'DESC')
      .getRawMany();

    const result = new Map<number, any[]>();
    for (const row of rows) {
      const subjectId = +row.subjectId;
      const arr = result.get(subjectId) || [];
      if (arr.length < limit) {
        arr.push({ id: +row.id, title: row.title, slug: row.slug, shortDesc: row.shortDesc, popularity: +row.popularity });
        result.set(subjectId, arr);
      }
    }
    return result;
  }

  async getGlobalPopularTopics(limit = 10): Promise<any[]> {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'id')
      .addSelect('t.title', 'title')
      .addSelect('t.slug', 'slug')
      .addSelect('t.subjectId', 'subjectId')
      .addSelect('s.title', 'subjectName')
      .addSelect('COUNT(qa.id)', 'totalAttempts')
      .from('topic', 't')
      .innerJoin('subject', 's', 's.id = t.subjectId')
      .innerJoin('question_topic', 'qt', 'qt.topicId = t.id')
      .innerJoin('question', 'q', 'q.id = qt.questionId')
      .innerJoin('question_attempt', 'qa', 'qa.questionId = q.id')
      .where('t.isPublished = 1')
      .groupBy('t.id')
      .orderBy('COUNT(qa.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id, title: r.title, slug: r.slug,
      subjectId: +r.subjectId, subjectName: r.subjectName,
      totalAttempts: +r.totalAttempts,
    }));
  }
}
