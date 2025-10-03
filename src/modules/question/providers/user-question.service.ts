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

async getUniqueQuizQuestionsFor(
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
  console.log("getUniqueQuizQuestionsFor #1 Input DTO:", dto);
  // Step 1: Get all questions the user has already answered correctly
  const correctAttempts = await this.dataSource.getRepository(QuestionAttempt)
    .createQueryBuilder("qa")
    .select("qa.questionId", "questionId")
    .where("qa.userId = :userId", { userId })
    .andWhere("qa.isCorrect = true")
    .getRawMany();

  const excludedIds = correctAttempts.map(a => a.questionId);
  console.log("getUniqueQuizQuestionsFor #2 Excluded QuestionIds (already correct):", excludedIds);

  const isTopicBased = topicIds.length > 0;
  const groupIds = isTopicBased ? topicIds : subjectIds;
  const perGroupCount = Math.ceil(numQuestions / groupIds.length);

  console.log("getUniqueQuizQuestionsFor #3 Group Type:", isTopicBased ? "Topics" : "Subjects", "Groups:", groupIds);

  // Step 2: Fetch random questions per group
  const groupPromises = groupIds.map(groupId => {
    const qb = this.questionRepo.createQueryBuilder("question")
      .addSelect("RAND()", "rand")
      .leftJoinAndSelect("question.subject", "subject")
      .leftJoinAndSelect("question.options", "options")
      .leftJoinAndSelect("question.questionTopics", "qt")
      .leftJoinAndSelect("qt.topic", "topic")
      .where("question.questionType = :type", { type: QuestionTypeEnum.Trivia })
      .andWhere("question.status = :status", { status: QuestionStatusEnum.Active })
      .andWhere("question.id NOT IN (:...excludedIds)", { excludedIds: excludedIds.length ? excludedIds : [0] })
      .take(perGroupCount)
      .orderBy("rand");

    if (isTopicBased) {
      qb.andWhere("qt.topicId = :groupId", { groupId });
    } else {
      qb.andWhere("question.subjectId = :groupId", { groupId });
    }

    console.log(`getUniqueQuizQuestionsFor #4 Query for groupId=${groupId}`);
    return qb.getMany();
  });

  let groupResults = await Promise.all(groupPromises);
  let uniqueQuestions = [...new Map(groupResults.flat().map(q => [q.id, q])).values()];
  console.log("getUniqueQuizQuestionsFor #5 Questions fetched initially:", uniqueQuestions.map(q => q.id));

  // Step 3: Fallback if not enough questions
  if (uniqueQuestions.length < numQuestions) {
    const missingCount = numQuestions - uniqueQuestions.length;
    const existingIds = uniqueQuestions.map(q => q.id);

    console.log(`getUniqueQuizQuestionsFor #6 Not enough questions. Missing: ${missingCount}`);

    const fallbackQb = this.questionRepo.createQueryBuilder("question")
      .addSelect("RAND()", "rand")
      .leftJoinAndSelect("question.subject", "subject")
      .leftJoinAndSelect("question.options", "options")
      .leftJoinAndSelect("question.questionTopics", "qt")
      .leftJoinAndSelect("qt.topic", "topic")
      .where("question.questionType = :type", { type: QuestionTypeEnum.Trivia })
      .andWhere("question.status = :status", { status: QuestionStatusEnum.Active })
      .andWhere("question.id NOT IN (:...excludedIds)", { excludedIds: excludedIds.length ? excludedIds : [0] })
      .orderBy("rand")
      .take(missingCount);

    if (existingIds.length > 0) {
      fallbackQb.andWhere("question.id NOT IN (:...existingIds)", { existingIds });
    }

    if (isTopicBased) {
      fallbackQb.andWhere("qt.topicId IN (:...topicIds)", { topicIds });
    } else {
      fallbackQb.andWhere("question.subjectId IN (:...subjectIds)", { subjectIds });
    }

    const fallbackQuestions = await fallbackQb.getMany();
    console.log("getUniqueQuizQuestionsFor #7 Fallback questions fetched:", fallbackQuestions.map(q => q.id));

    uniqueQuestions = [...new Map([...uniqueQuestions, ...fallbackQuestions].map(q => [q.id, q])).values()];
  }

  const finalQuestions = uniqueQuestions.slice(0, numQuestions);
  console.log("getUniqueQuizQuestionsFor #8 Final Questions Selected:", finalQuestions.map(q => q.id));

  if (finalQuestions.length < numQuestions) {
    throw new AppCustomException(
      HttpStatus.NO_CONTENT,
      `Not enough unique questions available. Found ${finalQuestions.length}, need ${numQuestions}.`
    );
  }

  // Step 4: Fetch relations (options, topics) for mapping
  const questionIds = finalQuestions.map(q => q.id);

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

  console.log("getUniqueQuizQuestionsFor #9 Mapping completed. Returning response.");
  return this.mappedQuestionList(finalQuestions, topicsMap, optionsMap);
}

//Also in question.service
  private mappedQuestionList(
    questions: Question[],
    topicsMap?: Map<number, any[]>,
    optionsMap?: Map<number, any[]>,
  ): any[] {
    return questions.map((q) => ({
      id: q.id,
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
      topics: topicsMap.get(q.id) || [],
      options: optionsMap.get(q.id) || [],
      //topics: q.questionTopics,
      //options: q.options,
      userCreatedBy: q?.userCreatedBy
        ? {
          id: q.userCreatedBy.id,
          firstName: q.userCreatedBy.firstName,
          lastName: q.userCreatedBy.lastName,
          email: q.userCreatedBy.email,
        }
        : null,
    }));
  }
}
