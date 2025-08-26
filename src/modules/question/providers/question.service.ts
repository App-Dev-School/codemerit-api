import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
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
import { QuestionTopicService } from './question-topic.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private readonly dataSource: DataSource,
    private readonly questionTopicRepo: QuestionTopicService,
    private readonly questionOptionService: QuestionOptionService,
  ) {}

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

  findOneBySlug(slug: string) {
    return this.questionRepo.findOne({
      where: { slug },
      relations: ['options'],
    });
  }

  // update(id: number, data: Partial<Question>) {
  //   return this.questionRepo.update(id, data);
  // }

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
          `User dont have permission to delete`,
        );
      }
    } else {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Question with id ${id} not found`,
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
        `User dont have permission to update this question`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const question = await this.findOne(id);

      if (!question) {
        throw new AppCustomException(
          HttpStatus.NOT_FOUND,
          `Question with id ${id} not found`,
        );
      }
      const updatedQuestion = this.questionRepo.merge(question, dto);

      const { options, ...questionData } = updatedQuestion;
      const savedQuestion = await queryRunner.manager.save(
        Question,
        questionData,
      );

      // if (dto?.topicIds && dto.topicIds.length > 0) {
      //   await queryRunner.manager.delete(QuestionTopic, {
      //     questionId: savedQuestion?.id,
      //   });
      //   await this.saveQuestionTopic(
      //     queryRunner.manager,
      //     dto?.topicIds,
      //     savedQuestion.id,
      //   );
      // }
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

      if (dto?.options && dto.options?.length > 0) {
        if (dto.questionType !== QuestionTypeEnum.General) {
          // await queryRunner.manager.delete(QuestionOption, {
          //   questionId: savedQuestion?.id,
          // });
          await this.saveOption(
            queryRunner.manager,
            dto?.options,
            savedQuestion.id,
          );
        } else {
          await queryRunner.manager.delete(QuestionOption, {
            questionId: savedQuestion?.id,
          });
        }
      }

      // let optionsList: TriviaOption[] = [];
      // for (const optionId of dto.options) {
      //   const triviaOption = new TriviaOption();
      //   triviaOption.triviaId = savedTrivia.id;
      //   triviaOption.optionId = optionId;
      //   optionsList.push(triviaOption);
      // }
      // let questionList: QuestionTopic[] = [];
      // for (const topicId of dto.topicIds) {
      //   const topic = new QuestionTopic();
      //   topic.questionId = savedQuestion.id;
      //   topic.topicId = topicId;
      //   questionList.push(topic);
      // }
      // await queryRunner.manager.save(QuestionTopic, questionList);

      // await this.saveQuestionTopic(
      //   queryRunner.manager,
      //   dto?.topicIds,
      //   savedQuestion.id,
      // );

      // if (dto.questionType !== QuestionTypeEnum.General) {
      //   await this.saveOption(
      //     queryRunner.manager,
      //     dto?.options,
      //     savedQuestion.id,
      //   );
      // }

      await queryRunner.commitTransaction();
      return savedQuestion;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to update Question',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const questionEntity = this.questionRepo.create(dto);
      const errors = await validate(questionEntity);
      if (errors.length) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          `Failed to create question`,
        );
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
          throw new AppCustomException(
            HttpStatus.NOT_FOUND,
            'Topics are mendatory.',
          );
        }
        if (dto.questionType !== QuestionTypeEnum.General) {
          if (dto.options?.length > 0) {
            await this.saveOption(
              queryRunner.manager,
              dto?.options,
              savedQuestion.id,
            );
          } else {
            throw new AppCustomException(
              HttpStatus.NOT_FOUND,
              'Options are mendatory for selected question type',
            );
          }
        }
      }
      await queryRunner.commitTransaction();
      return this.findOne(savedQuestion.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to create the question set. Please try again.',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getQuestionListForAdmin(
    subjectId: number,
  ): Promise<AdminQuestionResponseDto[]> {
    let questionResponseDto: AdminQuestionResponseDto[] = [];
    if (subjectId) {
      const questionList = await this.findQuestionListBySubjectId(subjectId);

      if (!questionList) {
        throw new AppCustomException(
          HttpStatus.NOT_FOUND,
          'No Question found for the given subject',
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
        questionDto.topics =
          await this.questionTopicRepo.findQuestionTopicsByQuestionId(
            question.id,
          );
        questionResponseDto.push(questionDto);
      }
    }

    return questionResponseDto;
  }

  // async getQuestionList(subjectId: number): Promise<QuestionResponseDto[]> {
  //   let questionResponseDto: QuestionResponseDto[] = [];
  //   if (subjectId) {
  //     const questionList = await this.findQuestionListBySubjectId(subjectId);
  //     if (!questionList) {
  //       throw new AppCustomException(
  //         HttpStatus.NOT_FOUND,
  //         'No Question found for the given subject',
  //       );
  //     }
  //     for (const question of questionList) {
  //       const questionDto = new QuestionResponseDto();
  //       questionDto.id = question.id;
  //       questionDto.title = question.title;
  //       questionDto.question = question.question;
  //       questionDto.subjectId = question.subjectId;
  //       questionDto.subject = question.subject.title;
  //       questionDto.level = question.level;
  //       questionDto.order = question.order;
  //       questionDto.marks = question.marks;
  //       questionDto.status = question.status;
  //       questionDto.hint = question.hint || '';
  //       questionDto.topics =
  //         await this.questionTopicRepo.findQuestionTopicsByQuestionId(
  //           question.id,
  //         );
  //       questionDto.options = await this.questionOptionService.findByQuestionId(
  //         question.id,
  //       );
  //       questionResponseDto.push(questionDto);
  //     }
  //   }

  //   return questionResponseDto;
  // }
  async findQuestionListBySubjectId(
    subjectId: number,
  ): Promise<Question[] | undefined> {
    const whereCondition = subjectId > 0 ? { subjectId } : undefined;
    return this.questionRepo.find({
      where: whereCondition,
      relations: ['subject', 'userCreatedBy'],
      order: {
        id: 'DESC', // or 'createdAt': 'DESC' if you have a createdAt column
      },
      take: 500,
    });
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
  async getQuestionsByIds(
    dto: GetQuestionsByIdsDto,
  ): Promise<QuestionListResponseDto[]> {
    if (
      (!dto.subjectIds || dto.subjectIds.length === 0) &&
      (!dto.topicIds || dto.topicIds.length === 0) &&
      (!dto.jobIds || dto.jobIds.length === 0)
    ) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'At least one of subjectIds, topicIds, or jobIds must be provided.',
      );
    }

    let subjectIds: number[] = [];
    if (dto.jobIds && dto.jobIds.length > 0) {
      const jobRoleSubjects = await this.dataSource
        .getRepository(JobRoleSubject)
        .find({
          where: { jobRoleId: In(dto.jobIds) },
        });
      subjectIds = jobRoleSubjects.map((jrs) => jrs.subjectId);
    } else if (dto.subjectIds && dto.subjectIds.length > 0) {
      subjectIds = dto.subjectIds;
    }

    let questions: Question[] = [];
    if (subjectIds.length > 0) {
      questions = await this.questionRepo.find({
        where: { subjectId: In(subjectIds) },
        relations: ['subject'],
      });
    } else if (dto.topicIds && dto.topicIds.length > 0) {
      const questionTopics = await this.dataSource
        .getRepository(QuestionTopic)
        .find({
          where: { topicId: In(dto.topicIds) },
        });
      const questionIds = questionTopics.map((qt) => qt.questionId);
      questions = await this.questionRepo.find({
        where: { id: In(questionIds) },
        relations: ['subject'],
      });
    }

    if (!questions.length) return [];
    const options = await this.dataSource.getRepository(QuestionOption).find({
      where: { questionId: In(questions.map((q) => q.id)) },
    });
    const questionTopics = await this.dataSource
      .getRepository(QuestionTopic)
      .find({
        where: { questionId: In(questions.map((q) => q.id)) },
        relations: ['topic'],
      });

    const optionsMap = new Map<number, any[]>();
    for (const option of options) {
      if (!optionsMap.has(option.questionId))
        optionsMap.set(option.questionId, []);
      optionsMap.get(option.questionId).push(option);
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

    return this.mappedQuestionList(questions, topicsMap, optionsMap);
  }

  private mappedQuestionList(
    questions: Question[],
    topicsMap: Map<number, any[]>,
    optionsMap: Map<number, any[]>,
  ): QuestionListResponseDto[] {
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
      order: q.order,
      createdAt: q.createdAt,
      subject: q.subject,
      topics: topicsMap.get(q.id) || [],
      options: optionsMap.get(q.id) || [],
    }));
  }
}
