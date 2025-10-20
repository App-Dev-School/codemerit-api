import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class QuizResultService {
  constructor(
    private readonly dataSource: DataSource
  ) { }
  //subject and topic stats are not working currently
  async getQuizResultByCode(resultCode: string) {
    // 1. Fetch base quiz + user + quiz result
    const base = await this.dataSource
      .createQueryBuilder(QuizResult, 'r')
      .select([
        'r.id',
        'r.resultCode',
        'r.quizId',
        'r.userId',
        'r.total',
        'r.correct',
        'r.wrong',
        'r.unanswered',
        'r.score',
        'r.remarks',
        'r.createdAt',
        'q.title',
        'q.description',
        'q.slug',
        'q.quizType',
        'u.id',
        'u.firstName',
        'u.lastName',
        'u.username',
      ])
      .innerJoin('r.quiz', 'q')
      .innerJoin('r.user', 'u')
      .where('r.resultCode = :resultCode', { resultCode })
      .getRawOne();

    if (!base) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, 'Result not found');
    }

    const quizId = base.r_quizId;
    const userId = base.r_userId;

    // 2. Fetch QuestionAttempts for this quiz + user
    const questionRows = await this.dataSource
      .createQueryBuilder(QuestionAttempt, 'qa')
      .select([
        'qa.id AS attemptId',
        'q.id AS questionId',
        'q.question AS text',
        'q.subjectId AS subjectId',
        's.title AS subjectTitle',
        's.slug AS subjectSlug',
        's.image AS subjectImage',
        't.id AS topicId',
        't.title AS topicTitle',
        'qa.isSkipped AS isSkipped',
        'qa.isCorrect AS isCorrect',
      ])
      .innerJoin('qa.question', 'q')
      .innerJoin('q.subject', 's')
      .leftJoin('q.questionTopics', 'qt')
      .leftJoin('qt.topic', 't')
      .innerJoin(QuizQuestion, 'qq', 'qq.questionId = q.id AND qq.quizId = :quizId', { quizId })
      .where('qa.userId = :userId', { userId })
      .getRawMany();

    // 3. Build questions array with options
    const questions = await Promise.all(
      questionRows.map(async (r) => {
        const options = await this.dataSource
          .createQueryBuilder(QuestionOption, 'qo')
          .select(['qo.id', 'qo.option AS text', 'qo.correct AS correct'])
          .where('qo.questionId = :questionId', { questionId: r.questionId })
          .getRawMany();

        return {
          id: r.questionId,
          text: r.text,
          options,
          isSkipped: r.isSkipped ?? false,
          isCorrect: r.isCorrect ?? false,
          subjectId: r.subjectId,
          topicId: r.topicId,
        };
      })
    );

    // 4. Aggregate subjects
    const subjectsMap = new Map<number, any>();
    questionRows.forEach((r) => {
      if (!subjectsMap.has(r.subjectId)) {
        subjectsMap.set(r.subjectId, {
          id: r.subjectId,
          title: r.subjectTitle,
          slug: r.subjectSlug,
          image: r.subjectImage,
          asked: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          score: 0,
        });
      }
      const sub = subjectsMap.get(r.subjectId);
      sub.asked += 1;
      if (r.isSkipped === false) sub.answered += 1;
      if (r.isCorrect === true) {
        sub.correct += 1;
        sub.score += 1;
      } else if (r.isSkipped === false && r.isCorrect === false) {
        sub.wrong += 1;
        sub.score -= 0.2; // negative marking
      }
    });

    const subjects = Array.from(subjectsMap.values()).map((s) => ({
      ...s,
      coverage: s.asked ? +((s.answered / s.asked) * 100).toFixed(1) : 0,
      accuracy: s.answered ? +((s.correct / s.answered) * 100).toFixed(1) : 0,
    }));

    // 5. Aggregate topics
    const topicsMap = new Map<number, any>();
    questionRows.forEach((r) => {
      if (!r.topicId) return; // some questions may not have a topic
      if (!topicsMap.has(r.topicId)) {
        topicsMap.set(r.topicId, {
          id: r.topicId,
          title: r.topicTitle,
          asked: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          score: 0,
        });
      }
      //correct these
      const t = topicsMap.get(r.topicId);
      console.log("@Verify QuizResult topicMap", topicsMap);
      console.log("@Verify QuizResult topicMap for t=", t);
      t.asked += 1;
      if (r.isSkipped === false) t.answered += 1;
      if (r.isCorrect === true) {
        t.correct += 1;
        t.score += 1;
      } else if (r.isSkipped === false && r.isCorrect === false) {
        t.wrong += 1;
        t.score -= 0.2;
      }
    });

    const topics = Array.from(topicsMap.values()).map((t) => ({
      ...t,
      // coverage: t.asked ? +((t.answered / t.asked) * 100).toFixed(1) : 0,
      // accuracy: t.answered ? +((t.correct / t.answered) * 100).toFixed(1) : 0,
      coverage: t.asked ? ((t.asked / questions.length) * 100).toFixed(1) : 0,
      accuracy: t.answered ? +((t.correct / t.answered) * 100).toFixed(1) : 0,
    }));

    // 6. Final response
    return {
      resultCode: base.r_resultCode,
      score: Number(base.r_score) || 0,
      accuracy: base.r_total ? +((base.r_correct / base.r_total) * 100).toFixed(1) : 0,
      total: Number(base.r_total) || 0,
      correct: Number(base.r_correct) || 0,
      wrong: Number(base.r_wrong) || 0,
      unanswered: Number(base.r_unanswered) || 0,
      remarks: base.r_remarks ?? '',
      createdAt: base.r_createdAt,
      user: {
        id: base.u_id,
        firstName: base.u_firstName,
        lastName: base.u_lastName,
        username: base.u_username,
      },
      quiz: {
        id: base.r_quizId,
        title: base.q_title,
        description: base.q_description,
        slug: base.q_slug,
        quizType: base.q_quizType,
      },
      subjects,
      topics,
      questions,
    };
  }
}
