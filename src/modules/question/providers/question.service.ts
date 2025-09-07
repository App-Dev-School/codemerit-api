import {
  BadRequestException,
  HttpStatus,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { GetUserRequestDto } from 'src/core/auth/dto/get-user-request.dto';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AdminQuestionResponseDto } from '../dtos/admin-question-response.dto';
import { CreateOptionDto } from '../dtos/create-option.dto';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { GetQuestionsByIdsDto } from '../dtos/get-questions-by-ids.dto';
import { QuestionListResponseDto } from '../dtos/question-list-response.dto';
import { UpdateQuestionDto } from '../dtos/update-question.dto';
import { QuestionOptionService } from './question-option.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,
    private readonly dataSource: DataSource,
    private readonly questionOptionService: QuestionOptionService,
  ) { }

  findAll() {
    return this.questionRepo.find();
  }

  findOne(id: number) {
    return this.questionRepo.findOne({ where: { id } });
  }

  findOneWithAuidt(id: number) {
    return this.questionRepo.findOne({
      where: { id },
      select: ['id', 'createdBy', 'updatedBy', 'questionType', 'status'],
    });
  }

  async findOneBySlug(slug: string) {
    const question = await this.questionRepo.findOne({
      where: { slug },
      relations: [
        'options',
        'questionTopics',
        'questionTopics.topic',
        'userCreatedBy',
        'subject',
      ],
    });

    // Build topic list
    const topics = question.questionTopics.map((qt) => ({
      id: qt.topic.id,
      title: qt.topic.title,
    }));

    const subjectTitle = question.subject?.title ?? null;
    const userCreatedBy = question.userCreatedBy
      ? {
        id: question.userCreatedBy.id,
        firstName: question.userCreatedBy.firstName,
        lastName: question.userCreatedBy.lastName,
        email: question.userCreatedBy.email,
        username: question.userCreatedBy.username,
      }
      : null;

    // Destructure to remove questionTopics and userCreatedBy from the base object
    const { questionTopics, userCreatedBy: _, ...rest } = question;

    // Final output object
    const questionWithTopics = {
      ...rest,
      topics,
      userCreatedBy,
      subjectTitle: subjectTitle,
    };
    return questionWithTopics;
  }

  async remove(id: number, user: GetUserRequestDto) {
    const question = await this.findOneWithAuidt(id);
    if (question) {
      if (
        user.role == UserRoleEnum.ADMIN ||
        (user.role == UserRoleEnum.MODERATOR && user.id == question?.createdBy)
      ) {
        await this.dataSource.transaction(async (manager) => {
          await manager.delete(QuestionOption, { questionId: question.id });
          await manager.delete(QuestionTopic, { questionId: question.id });
          await manager.delete(Question, { id: question.id });
        });
      } else {
        throw new AppCustomException(
          HttpStatus.NOT_FOUND,
          `User dont have permission to delete.`,
        );
      }
    } else {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Question not found.`,
      );
    }
    // await this.questionRepo.delete(id);
    // return { deleted: true };
  }

  async updateQuestion(
    id: number,
    dto: UpdateQuestionDto,
    user: GetUserRequestDto,
  ): Promise<Question> {
    if (!dto.questionType) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Question Type is required`,
      );
    }

    const questionAdut = await this.findOneWithAuidt(id);
    if (
      user.role == UserRoleEnum.MODERATOR &&
      user.id !== questionAdut?.createdBy
    ) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `User dont have permission to update this question.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let msg = '';
    try {
      const question = await this.findOne(id);

      if (!question) {
        msg = `Question with id ${id} not found`;
        throw new BadRequestException();
      }
      const updatedQuestion = this.questionRepo.merge(question, dto);

      const { options, ...questionData } = updatedQuestion;
      const savedQuestion = await queryRunner.manager.save(
        Question,
        questionData,
      );

      if (dto?.topicIds && dto.topicIds.length > 0) {
        const existingTopics = await queryRunner.manager.find(QuestionTopic, {
          where: { questionId: savedQuestion.id },
        });

        const staleTopicIds = existingTopics
          .map((qt) => qt.topicId)
          .filter((id) => !dto.topicIds.includes(id));

        if (staleTopicIds.length > 0) {
          await queryRunner.manager.delete(QuestionTopic, {
            questionId: savedQuestion.id,
            topicId: In(staleTopicIds),
          });
        }

        const existingTopicIds = new Set(
          existingTopics.map((qt) => qt.topicId),
        );

        const newTopicIds = dto.topicIds.filter(
          (id) => !existingTopicIds.has(id),
        );

        const newTopics = newTopicIds.map((topicId) => ({
          topicId,
          questionId: savedQuestion.id,
        }));
        if (newTopicIds.length > 0) {
          await this.saveQuestionTopic(
            queryRunner.manager,
            newTopicIds,
            savedQuestion.id,
          );
        }
      }

      if (dto.questionType !== QuestionTypeEnum.General) {
        if (dto.options?.length >= 2) {
          const hasCorrectOption = dto.options.some(
            (opt: CreateOptionDto) => opt.correct === true,
          );
          if (!hasCorrectOption) {
            msg = 'At least one option must be marked as correct.';
            throw new BadRequestException();
          }
          await this.saveOption(
            queryRunner.manager,
            dto?.options,
            savedQuestion.id,
          );
        } else {
          msg = 'At least 2 options are mendatory for selected question type';
          throw new BadRequestException();
        }
      } else {
        await queryRunner.manager.delete(QuestionOption, {
          questionId: savedQuestion?.id,
        });
      }
      // if (dto?.options && dto.options?.length > 0) {
      //   if (dto.questionType !== QuestionTypeEnum.General) {

      //     await this.saveOption(
      //       queryRunner.manager,
      //       dto?.options,
      //       savedQuestion.id,
      //     );
      //   } else {
      //     await queryRunner.manager.delete(QuestionOption, {
      //       questionId: savedQuestion?.id,
      //     });
      //   }
      // }

      await queryRunner.commitTransaction();
      return savedQuestion;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        msg ? msg : error.detail || error.message || error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    const queryRunner = this.dataSource.createQueryRunner();
    let msg = '';
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const questionEntity = this.questionRepo.create(dto);
      const errors = await validate(questionEntity);
      if (errors.length) {
        msg = 'Failed to create question => ' + errors.toString();
        throw new BadRequestException();
      }

      let slug = generateSlug(dto.question);

      const existing = await this.questionRepo.findOne({ where: { slug } });
      if (existing) {
        slug = generateUniqueSlug(dto.question);
      }
      questionEntity.slug = slug;
      const savedQuestion = await queryRunner.manager.save(
        Question,
        questionEntity,
      );

      if (savedQuestion) {
        if (dto?.topicIds && dto?.topicIds?.length > 0) {
          await this.saveQuestionTopic(
            queryRunner.manager,
            dto?.topicIds,
            savedQuestion.id,
          );
        } else {
          msg = 'Topics are mendatory';
          throw new BadRequestException();
        }
        if (dto.questionType !== QuestionTypeEnum.General) {
          if (dto.options?.length >= 2) {
            const hasCorrectOption = dto.options.some(
              (opt: CreateOptionDto) => opt.correct === true,
            );
            if (!hasCorrectOption) {
              msg = 'At least one option must be marked as correct.';
              throw new BadRequestException();
            }
            await this.saveOption(
              queryRunner.manager,
              dto?.options,
              savedQuestion.id,
            );
          } else {
            msg = 'At least 2 options are mendatory for selected question type';
            throw new BadRequestException();
          }
        }
      }
      await queryRunner.commitTransaction();
      return this.findOne(savedQuestion.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        msg ? msg : error.detail || error.message || error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getQuestionListForAdmin() // subjectId: number,
    : Promise<AdminQuestionResponseDto[]> {
    let questionResponseDto: AdminQuestionResponseDto[] = [];
    // if (subjectId >= 0) {
    let questionList = await this.fetchAllLatestQuestions();

    if (!questionList) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        'No Question found for the given subject.',
      );
    }
    for (const question of questionList) {
      const questionDto = new AdminQuestionResponseDto();
      questionDto.id = question.id;
      questionDto.question = question.question;
      questionDto.subjectId = question.subjectId;
      questionDto.subject = question.subject.title;
      questionDto.status = question.status;
      questionDto.level = question.level;
      questionDto.questionType = question.questionType;
      questionDto.slug = question.slug;
      questionDto.createdByUsername = question.userCreatedBy?.username;
      questionDto.createdByName =
        question.userCreatedBy?.firstName +
        ' ' +
        question.userCreatedBy?.lastName;
      questionResponseDto.push(questionDto);
    }
    // }

    return questionResponseDto;
  }

  async fetchAllLatestQuestions(): Promise<any[] | undefined> {
    //const whereCondition = subjectId > 0 ? { subjectId } : undefined;
    const whereCondition = {};
    // return this.questionRepo.find({
    //   where: whereCondition,
    //   relations: ['subject', 'questionTopics', 'questionTopics.topic', 'userCreatedBy'],
    //   order: {
    //     id: 'DESC',
    //   },
    //   take: 500,
    // });

    const questions = await this.questionRepo
      .createQueryBuilder('question')
      // Join subject (only select id and name)
      .leftJoin('question.subject', 'subject')
      .addSelect(['subject.id', 'subject.title'])
      // Join createdBy user (only select id and fullName)
      .leftJoin('question.userCreatedBy', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
      ])
      // Join questionTopics (no select needed, just for structure)
      .leftJoin('question.questionTopics', 'questionTopic')
      .leftJoin('questionTopic.topic', 'topic')
      .addSelect(['topic.id'])

      .where(whereCondition) // Your existing filter condition
      .orderBy('question.id', 'DESC')
      .take(500)
      .getMany();

    return questions;
  }

  private async saveOption(
    manager: EntityManager,
    optionsDtoList: CreateOptionDto[],
    questionId: number,
  ) {
    let optionList: QuestionOption[] = [];
    for (const optionObj of optionsDtoList) {
      let option = new QuestionOption();
      if (optionObj?.id) {
        option.id = optionObj?.id;
      }
      option.option = optionObj.option;
      option.correct = optionObj.correct;
      option.comment = optionObj.comment;
      option.questionId = questionId;

      optionList.push(option);
    }
    await this.questionOptionService.createWithQuestionId(manager, optionList);
  }

  private async saveQuestionTopic(
    manager: EntityManager,
    topicIds: number[],
    questionId: number,
  ) {
    let questionList: QuestionTopic[] = [];
    for (const topicId of topicIds) {
      const topic = new QuestionTopic();
      topic.questionId = questionId;
      topic.topicId = topicId;
      questionList.push(topic);
    }
    await manager.save(QuestionTopic, questionList);
  }

  async getQuestionsByIds(dto: GetQuestionsByIdsDto): Promise<QuestionListResponseDto[]> {
  const { subjectIds = [], topicIds = [], numberOfQuestions } = dto;

  if (subjectIds.length === 0 && topicIds.length === 0) {
    throw new AppCustomException(
      HttpStatus.BAD_REQUEST,
      'At least one of the subjects or topics must be provided.'
    );
  }

  const isTopicBased = topicIds.length > 0;
  const groupIds = isTopicBased ? topicIds : subjectIds;
  const perGroupCount = Math.ceil(numberOfQuestions / groupIds.length);

  // 🔄 Parallel query execution for groups
  const groupPromises = groupIds.map(groupId => {
    const qb = this.questionRepo.createQueryBuilder('question')
      .addSelect('RAND()', 'rand')
      .leftJoinAndSelect('question.subject', 'subject')
      .leftJoinAndSelect('question.options', 'options')
      .leftJoinAndSelect('question.questionTopics', 'questionTopics')
      .leftJoinAndSelect('questionTopics.topic', 'topic')
      .where('question.questionType = :type', { type: QuestionTypeEnum.Trivia })
      .andWhere('question.status = :status', { status: QuestionStatusEnum.Active })
      .take(perGroupCount)
      .orderBy('rand');

    if (isTopicBased) {
      qb.innerJoin('question.questionTopics', 'qt')
        .andWhere('qt.topicId = :groupId', { groupId });
    } else {
      qb.andWhere('question.subjectId = :groupId', { groupId });
    }

    return qb.getMany();
  });

  const groupResults = await Promise.all(groupPromises);
  const totalQuestions = groupResults.flat();

  // 🧹 Deduplicate by ID
  const questionMap = new Map<number, Question>();
  for (const q of totalQuestions) {
    questionMap.set(q.id, q);
  }

  let uniqueQuestions = Array.from(questionMap.values());

  // ⛑️ Fallback logic if not enough questions
  if (uniqueQuestions.length < numberOfQuestions) {
    const missingCount = numberOfQuestions - uniqueQuestions.length;

    const fallbackQb = this.questionRepo.createQueryBuilder('question')
     .addSelect('RAND()', 'rand') 
    .leftJoinAndSelect('question.subject', 'subject')
      .leftJoinAndSelect('question.options', 'options')
      .leftJoinAndSelect('question.questionTopics', 'questionTopics')
      .leftJoinAndSelect('questionTopics.topic', 'topic')
      .where('question.questionType = :type', { type: QuestionTypeEnum.Trivia })
      .andWhere('question.status = :status', { status: QuestionStatusEnum.Active })
      .andWhere('question.id NOT IN (:...existingIds)', {
        existingIds: uniqueQuestions.map(q => q.id),
      })
      .orderBy('rand')
      .take(missingCount);

    if (isTopicBased) {
      fallbackQb.andWhere('questionTopics.topicId IN (:...topicIds)', { topicIds });
    } else {
      fallbackQb.andWhere('question.subjectId IN (:...subjectIds)', { subjectIds });
    }

    const fallbackQuestions = await fallbackQb.getMany();

    for (const q of fallbackQuestions) {
      questionMap.set(q.id, q);
    }

    uniqueQuestions = Array.from(questionMap.values());
  }

  // 🧵 Final trim
  const finalQuestions = uniqueQuestions.slice(0, numberOfQuestions);

  if (finalQuestions.length < numberOfQuestions) {
    throw new AppCustomException(
      HttpStatus.BAD_REQUEST,
      `Not enough Trivia questions found. Found ${finalQuestions.length}, need ${numberOfQuestions}.`
    );
  }

  const questionIds = finalQuestions.map(q => q.id);

  // ⚡ Parallel batch fetch
  const [options, questionTopics] = await Promise.all([
    this.dataSource.getRepository(QuestionOption).find({
      where: { questionId: In(questionIds) },
    }),
    this.dataSource.getRepository(QuestionTopic).find({
      where: { questionId: In(questionIds) },
      relations: ['topic'],
    }),
  ]);

  // 🧭 Map options
  const optionsMap = new Map<number, any[]>();
  for (const opt of options) {
    if (!optionsMap.has(opt.questionId)) {
      optionsMap.set(opt.questionId, []);
    }
    optionsMap.get(opt.questionId).push(opt);
  }

  // 🧭 Map topics
  const topicsMap = new Map<number, any[]>();
  for (const qt of questionTopics) {
    if (!topicsMap.has(qt.questionId)) {
      topicsMap.set(qt.questionId, []);
    }
    if (qt.topic) {
      topicsMap.get(qt.questionId).push({
        id: qt.topic.id,
        title: qt.topic.title,
        description: qt.topic.description,
        createdAt: qt.topic.createdAt,
      });
    }
  }

  return this.mappedQuestionList(finalQuestions, topicsMap, optionsMap);
}


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

  private shuffleArray<T>(array: T[]): T[] {
    return array
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  async getQuestionsFromQIds(dto: GetQuestionsByIdsDto): Promise<QuestionListResponseDto[]> {
    const { questionIds } = dto;
    if (!questionIds || questionIds.length === 0) {
      throw new AppCustomException(HttpStatus.BAD_REQUEST, 'No question IDs provided.');
    }
    // Fetch questions by ID
    const questions = await this.questionRepo.find({
      where: { id: In(questionIds) },
    });
    // Fetch related options
    const options = await this.dataSource.getRepository(QuestionOption).find({
      where: { questionId: In(questionIds) },
    });
    // Fetch related topics via QuestionTopic
    const questionTopics = await this.dataSource
      .getRepository(QuestionTopic)
      .find({
        where: { questionId: In(questionIds) },
        relations: ['topic'],
      });
    // Map options to questions
    const optionsMap = new Map<number, any[]>();
    for (const option of options) {
      if (!optionsMap.has(option.questionId)) {
        optionsMap.set(option.questionId, []);
      }
      optionsMap.get(option.questionId).push(option);
    }
    // Map topics to questions
    const topicsMap = new Map<number, any[]>();
    for (const qt of questionTopics) {
      if (!topicsMap.has(qt.questionId)) {
        topicsMap.set(qt.questionId, []);
      }
      if (qt.topic) {
        topicsMap.get(qt.questionId).push({
          id: qt.topic.id,
          title: qt.topic.title,
          description: qt.topic.description,
          createdAt: qt.topic.createdAt,
        });
      }
    }
    // Use your existing mapper function
    return this.mappedQuestionList(questions, topicsMap, optionsMap);
  }

}
