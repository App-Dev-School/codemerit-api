import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AdminQuestionResponseDto } from '../dtos/admin-question-response.dto';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { GetQuestionDto } from '../dtos/get-question.dto';
import { QuestionTopicService } from './question-topic.service';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionOptionService } from './question-option.service';
import { UpdateQuestionDto } from '../dtos/update-question.dto';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { CreateOptionDto } from '../dtos/create-option.dto';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { validate } from 'class-validator';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { GetUserRequestDto } from 'src/core/auth/dto/get-user-request.dto';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

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
    return this.questionRepo.findOne({ where: { slug } });
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
      // Merge the DTO into the entity
      const updatedQuestion = this.questionRepo.merge(question, dto);

      const savedQuestion = await queryRunner.manager.save(
        Question,
        updatedQuestion,
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
        'Failed to create Question',
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
    return this.questionRepo.find({
      where: {
        subjectId: subjectId,
      },
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
}
