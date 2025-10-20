import {
  HttpStatus,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { DataSource, In, Repository } from 'typeorm';
import { GetQuestionsByIdsDto } from '../dtos/get-questions-by-ids.dto';
import { QuestionListResponseDto } from '../dtos/question-list-response.dto';
@Injectable()
export class UserQuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private readonly dataSource: DataSource
  ) { }

  async getUniqueQuizForQuestions(
    userId: number,
    dto: GetQuestionsByIdsDto
  ): Promise<QuestionListResponseDto[]> {

    const { subjectIds = [], topicIds = [], numQuestions = 10 } = dto;
    if (subjectIds.length === 0 && topicIds.length === 0) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'At least one of the subjects or topics must be provided.'
      );
    }
    const isTopicBased = topicIds.length > 0;
    const groupIds = isTopicBased ? topicIds : subjectIds;
    const perGroupCount = Math.ceil(numQuestions / groupIds.length);

    const groupColumn = isTopicBased ? 'qt.topicId' : 'q.subjectId';
    const groupIdList = groupIds.map(() => '?').join(',');

    let uniqueQuestions = await this.getUniqueQuestions(groupColumn, groupIdList, userId, groupIds, perGroupCount);

    // let uniqueQuestions = rawResults;

    if (uniqueQuestions.length < numQuestions) {
      // 2nd part
      const missingCount = numQuestions - uniqueQuestions.length;
      const existingIds = uniqueQuestions.map(q => q.questionId);

      // Avoid empty IN () issues by falling back to [0]
      const listOfExistingIds = existingIds.length ? existingIds : [0];

      const randomQuestions = await this.getRandomQuestions(groupColumn, groupIdList, userId, groupIds, listOfExistingIds, missingCount);

      uniqueQuestions = [...uniqueQuestions, ...randomQuestions];
      // uniqueQuestions = [...new Map([...uniqueQuestions, ...randomQuestions].map((q:any) => [q.questionId, q])).values()];
    }

    if (uniqueQuestions && uniqueQuestions.length == 0) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Not enough unique questions available. Found ${uniqueQuestions.length}, need ${numQuestions}.`
      );
    }

    // Step 4: Fetch relations (options, topics) for mapping
    const questionIds = uniqueQuestions.map(q => q.questionId);

    const [options, questionTopics] = await Promise.all([
      this.dataSource.getRepository(QuestionOption).find({ where: { questionId: In(questionIds) } }),
      this.dataSource.getRepository(QuestionTopic).find({ where: { questionId: In(questionIds) }, relations: ["topic"] }),
    ]);

    const optionsMap = new Map<number, QuestionOption[]>();
    for (const opt of options) {
      if (!optionsMap.has(opt.questionId)) optionsMap.set(opt.questionId, []);
      optionsMap.get(opt.questionId).push(opt);
    }

    const topicsMap = new Map<number, any[]>();
    for (const qt of questionTopics) {
      if (!topicsMap.has(qt.questionId)) topicsMap.set(qt.questionId, []);
      if (qt.topic) {
        topicsMap.get(qt.questionId).push({
          id: qt.topic.id,
          title: qt.topic.title,
          description: qt.topic.description,
          createdAt: qt.topic.createdAt,
        });
      }
    }
    return this.mappedQuestionList(uniqueQuestions, topicsMap, optionsMap);

  }

  //Also in question.service
  private mappedQuestionList(
    questions: Question[],
    topicsMap?: Map<number, any[]>,
    optionsMap?: Map<number, any[]>,
  ): any[] {
    return questions.map((q: any) => ({
      id: (q.id) ? q.id : q.questionId,
      title: q.title,
      question: q.question,
      subjectId: q.subjectId,
      questionType: q.questionType,
      level: q.level,
      marks: q.marks,
      slug: q.slug,
      timeAllowed: q.timeAllowed,
      tag: q.tag,
      status: q.status,
      answer: q.answer,
      hint: q.hint,
      order: q.orderId,
      createdAt: q.createdAt,
      subject: q.subject,
      topics: topicsMap.get((q.id) ? q.id : q.questionId) || [],
      options: optionsMap.get((q.id) ? q.id : q.questionId) || [],
      //topics: q.questionTopics,
      //options: q.options,
      // userCreatedBy: q?.userCreatedBy
      //   ? {
      //     id: q.userCreatedBy.id,
      //     firstName: q.userCreatedBy.firstName,
      //     lastName: q.userCreatedBy.lastName,
      //     email: q.userCreatedBy.email,
      //   }
      //   : null,
    }));
  }


  private async getUniqueQuestions(groupColumn: any, groupIdList: any, userId: any, groupIds: any,
    perGroupCount: any): Promise<any[]> {

    const rawQuery = `
      WITH correct_questions AS (
        SELECT questionId
        FROM question_attempt
        WHERE userId = ? AND isCorrect = TRUE
      ),
      grouped_questions AS (
        SELECT 
        q.id AS questionId, q.title, q.question, q.questionType, q.level, q.marks, q.slug, q.timeAllowed, q.tag, q.status, q.answer, q.hint,
          q.orderId, q.createdAt,

          s.id AS subjectId, s.title AS subjectName,

          t.id AS topicId, t.title AS topicTitle, t.description AS topicDescription,

          ${groupColumn} AS groupId,
          ROW_NUMBER() OVER (PARTITION BY ${groupColumn} ORDER BY RAND()) as rn

        FROM question q

        LEFT JOIN subject s ON s.id = q.subjectId
        LEFT JOIN question_topic qt ON qt.questionId = q.id
        LEFT JOIN topic t ON t.id = qt.topicId

        WHERE q.questionType = 'Trivia'
          AND q.status = 'Active'
          AND ${groupColumn} IN (${groupIdList})
          AND NOT EXISTS (
            SELECT 1 FROM correct_questions cq WHERE cq.questionId = q.id
          )
      )
      SELECT *
      FROM grouped_questions
      WHERE rn <= ?
      ORDER BY level, groupId, RAND()
      `;
    const params = [
      userId,
      ...groupIds,
      perGroupCount
    ];
    return this.dataSource.query(rawQuery, params);
  }
  private async getRandomQuestions(groupColumn: any, groupIdList: any, userId: any, groupIds: any,
    listOfExistingIds: any, missingCount: any): Promise<any[]> {

    const params2 = [
      QuestionTypeEnum.Trivia,         // questionType
      QuestionStatusEnum.Active,       // status
      userId,                     // already selected
      listOfExistingIds,                 // existingIds from earlier selection
      ...groupIds,
      missingCount                     // limit
    ];
    const checkExistQuestionIds = `
      SELECT questionId
      FROM question_attempt
      WHERE userId = ? AND isCorrect = TRUE`;

    const query2 = `
      SELECT 
        q.id AS questionId, q.title, q.question, q.questionType, q.level, q.marks, q.slug, q.timeAllowed, q.tag, q.status, q.answer,
        q.hint, q.orderId, q.createdAt,

        s.id AS subjectId, s.title AS subjectName,

        t.id AS topicId, t.title AS topicTitle, t.description AS topicDescription

      FROM question q
      LEFT JOIN subject s ON s.id = q.subjectId
      LEFT JOIN question_topic qt ON qt.questionId = q.id
      LEFT JOIN topic t ON t.id = qt.topicId

      WHERE q.questionType = ?
        AND q.status = ?
        AND q.id NOT IN (${checkExistQuestionIds})
        AND q.id NOT IN (?)
        AND ${groupColumn} IN (${groupIdList})

      ORDER BY q.level, RAND()
      LIMIT ?;
  `;
    return this.dataSource.query(
      query2,
      params2
    );
  }


}
