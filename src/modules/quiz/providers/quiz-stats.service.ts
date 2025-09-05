import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class QuizStatsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,
  ) {}

  // Get Subject-wise Stats
  async getSubjectStatsForUser(userId: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('s.id', 'subjectId')
      .addSelect('s.title', 'subjectTitle')
      .addSelect('COUNT(DISTINCT qa.id)', 'attempted')
      .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
      .addSelect('SUM(CASE WHEN qa.isCorrect = false THEN 1 ELSE 0 END)', 'wrong')
      .from(Subject, 's')
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .leftJoin('question_attempt', 'qa', 'qa.questionId = q.id AND qa.userId = :userId', {
        userId,
      })
      .groupBy('s.id')
      .getRawMany();

    return result.map((row) => ({
      subjectId: +row.subjectId,
      subjectTitle: row.subjectTitle,
      attempted: +row.attempted || 0,
      correct: +row.correct || 0,
      wrong: +row.wrong || 0,
    }));
  }

  // Get Topic-wise Stats
  async getTopicStatsForUser(userId: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.subjectId', 'subjectId') // assuming topic has subjectId (if not, handle differently)
      .addSelect('COUNT(DISTINCT qa.id)', 'attempted')
      .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
      .addSelect('SUM(CASE WHEN qa.isCorrect = false THEN 1 ELSE 0 END)', 'wrong')
      .from('topic', 't')
      .leftJoin('question_topic', 'qt', 'qt.topicId = t.id')
      .leftJoin('question', 'q', 'q.id = qt.questionId')
      .leftJoin('question_attempt', 'qa', 'qa.questionId = q.id AND qa.userId = :userId', {
        userId,
      })
      .groupBy('t.id')
      .addGroupBy('t.subjectId')
      .getRawMany();

    return result.map((row) => ({
      topicId: +row.topicId,
      topicTitle: row.topicTitle,
      subjectId: +row.subjectId || null,
      attempted: +row.attempted || 0,
      correct: +row.correct || 0,
      wrong: +row.wrong || 0,
    }));
  }

  //  Combine Subject and Topic Stats
  async getUserQuizStats(userId: number) {
    const subjects = await this.getSubjectStatsForUser(userId);
    const topics = await this.getTopicStatsForUser(userId);

    // Group topics under corresponding subject
    const subjectMap = new Map<number, any>();

    for (const subject of subjects) {
      subjectMap.set(subject.subjectId, {
        ...subject,
        topics: [],
      });
    }

    for (const topic of topics) {
      if (topic.subjectId && subjectMap.has(topic.subjectId)) {
        subjectMap.get(topic.subjectId).topics.push(topic);
      } else {
        // Orphan topics (no subject found) — optional: push them separately
      }
    }

    return Array.from(subjectMap.values());
  }
}