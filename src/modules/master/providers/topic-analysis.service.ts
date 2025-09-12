import { Injectable } from '@nestjs/common';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TopicAnalysisService {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  // In your service class

/**
 * Build a base QB that returns per-topic aggregates.
 * - numTrivia: count of Trivia questions in the topic
 * - totalQuestions: ALL questions in the topic (any type)
 * - totalAttempts: ALL attempts (all users) on any questions in the topic
 * - If userId provided: numMyAttempts, myCorrect, myDistinctQuestions
 */
private buildTopicStatsBaseQB(userId?: number) {
  const qb = this.dataSource
    .createQueryBuilder()
    .from(Topic, 't')
    // --- Joins for ALL questions in the topic ---
    .leftJoin('question_topic', 'qtAll', 'qtAll.topicId = t.id')
    .leftJoin('question', 'qAll', 'qAll.id = qtAll.questionId')
    .leftJoin('question_attempt', 'qa', 'qa.questionId = qAll.id')
    // --- Joins for TRIVIA questions (numTrivia only) ---
    .leftJoin('question_topic', 'qtTr', 'qtTr.topicId = t.id')
    .leftJoin('question', 'qTr', 'qTr.id = qtTr.questionId AND qTr.questionType = :trivia', {
      trivia: QuestionTypeEnum.Trivia,
    })
    // --- Base selects ---
    .select('t.id', 'topicId')
    .addSelect('t.title', 'topicTitle')
    .addSelect('t.description', 'topicDesc')
    .addSelect('t.slug', 'slug')
    .addSelect('t.subjectId', 'subjectId')
    // counts
    .addSelect('COUNT(DISTINCT qTr.id)', 'numTrivia')
    .addSelect('COUNT(DISTINCT qAll.id)', 'totalQuestions')
    .addSelect('COUNT(qa.id)', 'totalAttempts') // all user attempts on any question in topic
    .groupBy('t.id');

  if (userId) {
    qb
      .leftJoin(
        'question_attempt',
        'myQa',
        'myQa.questionId = qAll.id AND myQa.userId = :userId',
        { userId }
      )
      .addSelect('COUNT(myQa.id)', 'numMyAttempts')
      .addSelect('SUM(CASE WHEN myQa.isCorrect = true THEN 1 ELSE 0 END)', 'myCorrect')
      .addSelect('COUNT(DISTINCT myQa.questionId)', 'myDistinctQuestions');
  } else {
    qb
      .addSelect('0', 'numMyAttempts')
      .addSelect('0', 'myCorrect')
      .addSelect('0', 'myDistinctQuestions');
  }

  return qb;
}

/** Map a raw row from base QB to the response shape (calculates derived fields in TS). */
private mapTopicRow(raw: any) {
  const numLessons = 0;
  const numTrivia = +raw.numTrivia || 0;
  const totalQuestions = +raw.totalQuestions || 0;
  const totalAttempts = +raw.totalAttempts || 0;
  const numMyAttempts = +raw.numMyAttempts || 0;
  const myCorrect = +raw.myCorrect || 0;
  const myDistinctQuestions = +raw.myDistinctQuestions || 0;

  const avgAccuracy = numMyAttempts > 0 ? myCorrect / numMyAttempts : 0;
  const score = (myCorrect /numMyAttempts) * 100;
  const isStarted = numMyAttempts > 0;
  const isCompleted = totalQuestions > 0 && myDistinctQuestions >= totalQuestions;

  return {
    id: +raw.topicId,
    title: raw.topicTitle,
    description: raw.topicDesc,
    slug: raw.slug,
    subjectId: +raw.subjectId,
    numTrivia,
    numLessons,
    totalAttempts,
    numMyAttempts,
    myCorrect,
    avgAccuracy,
    score,
    isStarted,
    isCompleted,
    meritList: null
  };
}

/** Get stats for a SINGLE topic (fast, filtered server-side). */
async getTopicStatsById(topicId: number, userId?: number, fullData = false) {
  const qb = this.buildTopicStatsBaseQB(userId)
    .where('t.id = :topicId', { topicId });

  const raw = await qb.getRawOne();
  if (!raw) return null;

  const stats: any = this.mapTopicRow(raw);

  if (fullData) {
    // Single-topic leaderboard
    stats.meritList = await this.getTopicMeritList(topicId, 10);
  }

  return stats;
}

/** Get stats for ALL topics under ONE subject (single grouped query). */
async getTopicStatsBySubject(subjectId: number, userId?: number, fullData = false) {
  const qb = this.buildTopicStatsBaseQB(userId)
    .where('t.subjectId = :subjectId', { subjectId });

  const raws = await qb.getRawMany();
  const topics = raws.map((r) => this.mapTopicRow(r));

  if (fullData && topics.length) {
    const topicIds = topics.map((t) => t.id);
    const meritLists = await this.getTopicMeritListForTopics(topicIds, 10);
    for (const t of topics) {
      t.meritList = meritLists.get(t.id) || [];
    }
  }

  return topics;
}

/** Get stats for ALL topics. Optionally pass pagination. */
async getAllTopicStats(userId?: number, fullData = false, offset = 0, limit = 100) {
  const qb = this.buildTopicStatsBaseQB(userId)
    .offset(offset)
    .limit(limit);

  const raws = await qb.getRawMany();
  const topics = raws.map((r) => this.mapTopicRow(r));

  if (fullData && topics.length) {
    const topicIds = topics.map((t) => t.id);
    const meritLists = await this.getTopicMeritListForTopics(topicIds, 10);
    for (const t of topics) {
      t.meritList = meritLists.get(t.id) || [];
    }
  }

  return topics;
}

/** 🏆 Single-topic merit list (all question types in the topic). */
private async getTopicMeritList(topicId: number, limit = 10) {
  const raw = await this.dataSource
    .createQueryBuilder()
    .from(User, 'u')
    .innerJoin('question_attempt', 'qa', 'qa.userId = u.id')
    .innerJoin('question', 'q', 'q.id = qa.questionId')
    .innerJoin('question_topic', 'qt', 'qt.questionId = q.id')
    .leftJoin('job_role', 'jr', 'jr.id = u.designation')
    .where('qt.topicId = :topicId', { topicId })
    .select('u.id', 'userId')
    .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
    .addSelect('u.username', 'username')
    .addSelect('u.image', 'image') // keep if you have this column
    .addSelect('jr.title', 'designationName')
    .addSelect('COUNT(qa.id)', 'totalAttempts')
    .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'totalCorrect')
    .addSelect(
      'ROUND(100.0 * SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END) / NULLIF(COUNT(qa.id),0), 2)',
      'accuracyPct'
    )
    .groupBy('u.id')
    .orderBy('totalCorrect', 'DESC')
    .addOrderBy('totalAttempts', 'DESC')
    .limit(limit)
    .getRawMany();

  return raw
    .map((r) => {
      const totalCorrect = +r.totalCorrect || 0;
      const totalAttempts = +r.totalAttempts || 0;
      const avgAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
      const score = totalCorrect * 0.5 + totalAttempts * 0.2 + (avgAccuracy * 100) * 0.3;

      return {
        id: +r.userId,
        name: r.name,
        username: r.username,
        image: r.image,
        designationName: r.designationName,
        totalCorrect,
        totalAttempts,
        avgAccuracy,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 🧮 Batched merit list for MANY topics using a window function (MySQL 8+).
 * Returns a Map<topicId, MeritRow[]> limited per-topic.
 */
private async getTopicMeritListForTopics(topicIds: number[], limitPerTopic = 10) {
  if (!topicIds.length) return new Map<number, any[]>();

  // Window function to pick top-N per topic
  const rows = await this.dataSource
    .createQueryBuilder()
    .from((qb) => {
      return qb
        .from('question_topic', 'qt')
        .innerJoin('question', 'q', 'q.id = qt.questionId')
        .innerJoin('question_attempt', 'qa', 'qa.questionId = q.id')
        .innerJoin('user', 'u', 'u.id = qa.userId')
        .leftJoin('job_role', 'jr', 'jr.id = u.designation')
        .where('qt.topicId IN (:...topicIds)', { topicIds })
        .select('qt.topicId', 'topicId')
        .addSelect('u.id', 'userId')
        .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
        .addSelect('u.username', 'username')
        .addSelect('u.image', 'image')
        .addSelect('jr.title', 'designationName')
        .addSelect('COUNT(qa.id)', 'totalAttempts')
        .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'totalCorrect')
        .groupBy('qt.topicId')
        .addGroupBy('u.id');
    }, 'x')
    .addSelect('x.topicId', 'topicId')
    .addSelect('x.userId', 'userId')
    .addSelect('x.name', 'name')
    .addSelect('x.username', 'username')
    .addSelect('x.image', 'image')
    .addSelect('x.designationName', 'designationName')
    .addSelect('x.totalAttempts', 'totalAttempts')
    .addSelect('x.totalCorrect', 'totalCorrect')
    .addSelect(
      // compute rank by a proxy of score: correct desc, attempts desc, accuracy desc
      `ROW_NUMBER() OVER (
         PARTITION BY x.topicId
         ORDER BY x.totalCorrect DESC, x.totalAttempts DESC
       )`,
      'rn'
    )
    .where('1 = 1') // wrapper needs a where to add selects in TypeORM
    .getRawMany();

  // post-process: compute true score and filter top-N per topic
  const buckets = new Map<number, any[]>();
  for (const r of rows) {
    const topicId = +r.topicId;
    const totalCorrect = +r.totalCorrect || 0;
    const totalAttempts = +r.totalAttempts || 0;
    const avgAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    const score = totalCorrect * 0.5 + totalAttempts * 0.2 + (avgAccuracy * 100) * 0.3;

    const arr = buckets.get(topicId) || [];
    arr.push({
      id: +r.userId,
      name: r.name,
      username: r.username,
      image: r.image,
      designationName: r.designationName,
      totalCorrect,
      totalAttempts,
      avgAccuracy,
      score,
    });
    buckets.set(topicId, arr);
  }

  // sort by score and cap per-topic
  for (const [topicId, arr] of buckets) {
    arr.sort((a, b) => b.score - a.score);
    buckets.set(topicId, arr.slice(0, limitPerTopic));
  }

  return buckets;
}
 
}
