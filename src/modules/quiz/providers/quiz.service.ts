import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizSettings } from 'src/common/typeorm/entities/quiz-settings.entity';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import {
  generate6DigitNumber,
  getTitleBySubjectIds,
  getTitleByTopicIds,
} from 'src/common/utils/common-functions';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { MasterService } from 'src/modules/master/providers/master.service';
import { GetQuestionsByIdsDto } from 'src/modules/question/dtos/get-questions-by-ids.dto';
import { QuestionService } from 'src/modules/question/providers/question.service';
import { UserQuestionService } from 'src/modules/question/providers/user-question.service';
import { DataSource, In, Repository } from 'typeorm';
import { CreateQuizDto } from '../dtos/create-quiz.dto';
import { SubmitQuizDto } from '../dtos/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizSettings)
    private quizSettingsRepository: Repository<QuizSettings>,
    @InjectRepository(QuizSubject)
    private quizSubjectRepo: Repository<QuizSubject>,
    @InjectRepository(QuizTopic)
    private quizTopicRepo: Repository<QuizTopic>,
    @InjectRepository(QuizResult)
    private quizResultRepository: Repository<QuizResult>,
    private readonly userQuestionService: UserQuestionService,
    private readonly questionService: QuestionService,
    private readonly masterService: MasterService,

    private readonly dataSource: DataSource,
  ) {}

  async fetchQuizBySlug(slug: string): Promise<any> {
    const quiz = await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.quizQuestions', 'quizQuestion')
      .where('quiz.slug = :slug', { slug })
      .getOne();

    if (!quiz) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, `Quiz not found.`);
    }

    if (!quiz.quizQuestions || quiz.quizQuestions.length === 0) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'No questions found for this quiz.',
      );
    }

    // Step 1: Collect questionIds
    const questionIds = quiz.quizQuestions.map((qq) => qq.questionId);

    // Step 2: Use QuestionService
    const ids = new GetQuestionsByIdsDto();
    ids.questionIds = questionIds;
    ids.numQuestions = 10;
    const questions = await this.questionService.getQuestionsFromQIds(ids);

    // Step 3: Return quiz with questions
    return {
      ...quiz,
      questions,
    };
  }

  async createQuiz(
    createQuizDto: CreateQuizDto,
    userId: number,
  ): Promise<Quiz> {
    console.log('quiz service called');
    console.log('QuizBuilder @createQuiz called:', createQuizDto);
    let quizCategory = '';
    if (
      !createQuizDto?.subjectIds?.length &&
      !createQuizDto?.topicIds?.length
    ) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Please specify at least one subject or topic to generate a quiz.',
      );
    }

    if (
      createQuizDto?.quizType === QuizTypeEnum.Standard &&
      !createQuizDto?.questionIds?.length
    ) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'questionIds is mandatory for Standard quiz type and must be a non-empty array of numbers.',
      );
    }

    console.log('QuizBuilder @createQuiz Start:', createQuizDto?.subjectIds);
    let topicIds: number[] = [];
    let subjectIds: number[] = [];
    const questionIds: number[] = createQuizDto?.questionIds ?? [];

    if (createQuizDto?.topicIds) {
      const topicStr = String(createQuizDto.topicIds); // ensure it's a string
      topicIds = topicStr.split(',').map((id) => parseInt(id.trim(), 10));
      quizCategory = 'Topic';
    }

    if (createQuizDto?.subjectIds) {
      const subjectStr = String(createQuizDto.subjectIds); // ensure it's a string
      subjectIds = subjectStr.split(',').map((id) => parseInt(id.trim(), 10));
      quizCategory = 'Subject';
    }

    const ids = new GetQuestionsByIdsDto();
    ids.subjectIds = subjectIds;
    ids.topicIds = topicIds;
    ids.questionIds = questionIds;
    const requestedNumQuestions =
      createQuizDto?.numQuestions ?? createQuizDto?.settings?.numQuestions;

    if (createQuizDto?.quizType === QuizTypeEnum.Standard) {
      ids.numQuestions = requestedNumQuestions
        ? Math.min(requestedNumQuestions, questionIds.length)
        : questionIds.length;
    } else if (createQuizDto?.quizType === QuizTypeEnum.UserQuiz) {
      if (requestedNumQuestions !== undefined && requestedNumQuestions <= 0) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          'For UserQuiz, numQuestions must be a positive number.',
        );
      }
      ids.numQuestions = requestedNumQuestions ?? 10;
    } else if (requestedNumQuestions && requestedNumQuestions > 0) {
      ids.numQuestions = requestedNumQuestions;
    } else {
      ids.numQuestions = 10;
    }

    console.log('QuizBuilder @Input:', ids);
    let questionObj: any = null;
    let questions: any[] = [];

    if (createQuizDto?.quizType === QuizTypeEnum.Standard) {
      questions = await this.questionService.getQuestionsFromQIds(ids);
    } else {
      questionObj = await this.userQuestionService.getUniqueQuizForQuestions(
        userId,
        ids,
      );
      questions = questionObj?.questions ?? [];
    }

    /*
    if (!questions || questions.length === 0) {
      throw new AppCustomException(
        HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
        "No unique questions found to generate quiz."
      );
    }
    */

    //#Task2: Ensure Quiz creates with unique questions but if there are no unique questions, generate random quiz
    //Implement specification with an easy to debug flow and proper response

    // Save quiz in DB if at least 3 questions are available
    if (!questions || questions.length === 0) {
      const questionCount = questions?.length ?? 0;
      console.log('QuizBuilder #4: @NotEnoughQuestions', questionCount);
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Not enough questions ${questionCount} found for the given ${quizCategory}`,
      );
    }
    try {
      let title = createQuizDto.title;
      if (!title) {
        if (subjectIds && subjectIds.length > 0) {
          const subjects =
            await this.masterService.getSubjectListByIds(subjectIds);
          title = getTitleBySubjectIds(subjects) + ' Quiz';
        }
        if (topicIds && topicIds.length > 0) {
          const topics = await this.masterService.getTopicListByIds(topicIds);
          title = getTitleByTopicIds(topics) + ' Quiz';
        }
      }
      const quiz = new Quiz();
      quiz.title = title;
      quiz.tag = quizCategory;
      quiz.quizType = createQuizDto.quizType;
      quiz.shortDesc = createQuizDto.shortDesc;
      quiz.description = createQuizDto.description;
      quiz.goal = createQuizDto.goal ?? null;
      quiz.label = createQuizDto.label;
      quiz.isPublished = createQuizDto.isPublished ?? false;
      let slug = generateSlug(title);
      let existingSlug = await this.quizRepository.findOne({ where: { slug } });
      while (existingSlug) {
        slug = generateUniqueSlug(title);
        existingSlug = await this.quizRepository.findOne({ where: { slug } });
      }
      quiz.slug = slug;
      //quiz.userId = userId;
      quiz.createdBy = userId;
      console.log('QuizBuilder #4: QuizToSave', quiz);
      return this.dataSource.transaction(async (manager) => {
        const savedQuizzes = await manager.save(Quiz, quiz);
        console.log('QuizBuilder #5: savedQuizzes', savedQuizzes);
        const quizQuestion: QuizQuestion[] = [];
        const quizSubject: QuizSubject[] = [];
        const quizTopic: QuizTopic[] = [];
        for (const question of questions) {
          const quizQuestionItem = new QuizQuestion();
          quizQuestionItem.quizId = savedQuizzes.id;
          quizQuestionItem.questionId = question.id;
          quizQuestion.push(quizQuestionItem);
        }

        await manager.save(QuizQuestion, quizQuestion);
        if (subjectIds && subjectIds.length > 0) {
          for (const id of subjectIds) {
            const quizSubjectItem = new QuizSubject();
            quizSubjectItem.quizId = savedQuizzes.id;
            quizSubjectItem.subjectId = id;
            quizSubject.push(quizSubjectItem);
          }
          await manager.save(QuizSubject, quizSubject);
        }
        if (topicIds && topicIds.length > 0) {
          for (const id of topicIds) {
            const quizTopicItem = new QuizTopic();
            quizTopicItem.quizId = savedQuizzes.id;
            quizTopicItem.topicId = id;
            quizTopic.push(quizTopicItem);
          }
          await manager.save(QuizTopic, quizTopic);
        }

        // Create quiz settings if Standard quiz (settings optional in payload, defaults applied in DTO)
        if (createQuizDto.quizType === 'Standard' && createQuizDto.settings) {
          const quizSettings = manager.create(QuizSettings, {
            ...createQuizDto.settings,
            quizId: savedQuizzes.id,
          });
          savedQuizzes.settings = await manager.save(
            QuizSettings,
            quizSettings,
          );
        }

        const response: any = {
          message: questionObj?.message
            ? questionObj?.message
            : 'Quiz created successfully.',
          quiz: savedQuizzes,
        };
        return response;
      });
    } catch (error) {
      console.log('QuizBuilder #6: ERROR', error);
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to save quiz and questions: ' + error.message,
      );
    }
  }

  //Generate a server level feedback utility
  //Process any achievement
  async submitQuiz(submitQuizDto: SubmitQuizDto): Promise<QuizResult> {
    try {
      return this.dataSource.transaction(async (manager) => {
        const result = manager.create(QuizResult, {
          quizId: submitQuizDto?.quizId,
          userId: submitQuizDto?.userId,
          resultCode: generate6DigitNumber(),
          total: submitQuizDto?.total,
          correct: submitQuizDto?.correct,
          wrong: submitQuizDto?.wrong,
          unanswered: submitQuizDto?.unanswered,
          timeSpent: submitQuizDto?.timeSpent,
          score: submitQuizDto?.score,
        });

        const questionResult = await manager.save(QuizResult, result);
        // 3. Save QuestionAttempts
        for (const attempt of submitQuizDto?.attempts) {
          const questionAttempt = manager.create(QuestionAttempt, {
            userId: submitQuizDto?.userId,
            questionId: attempt.questionId,
            selectedOption: attempt?.selectedOption,
            timeTaken: attempt?.timeTaken,
            isSkipped: attempt?.isSkipped,
            hintUsed: attempt?.hintUsed,
            isCorrect: attempt?.isCorrect,
            answer: attempt?.answer,
          });
          await manager.save(QuestionAttempt, questionAttempt);
        }
        return questionResult;
      });
    } catch (error) {
      console.log('QuizBuilder #6: Exception', error);
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to submit quiz result.',
      );
    }
  }

  async getAllStandardQuizzes(): Promise<any[]> {
    const quizzes = await this.quizRepository.find({
      where: { quizType: QuizTypeEnum.Standard, isPublished: true },
      order: { createdAt: 'DESC' },
    });

    if (!quizzes.length) {
      return [];
    }

    const quizIds = quizzes.map((quiz) => quiz.id);

    const [quizSubjects, quizTopics, quizSettings] = await Promise.all([
      this.quizSubjectRepo.find({
        where: { quizId: In(quizIds) },
        relations: ['subject'],
      }),
      this.quizTopicRepo.find({
        where: { quizId: In(quizIds) },
        relations: ['topic'],
      }),
      this.quizSettingsRepository.find({
        where: { quizId: In(quizIds) },
      }),
    ]);

    const subjectMap = new Map<number, any[]>();
    for (const quizSubject of quizSubjects) {
      const existing = subjectMap.get(quizSubject.quizId) || [];
      if (quizSubject.subject) {
        const { id, title, description, createdAt } = quizSubject.subject;
        existing.push({ id, title, description, createdAt });
      }
      subjectMap.set(quizSubject.quizId, existing);
    }

    const topicMap = new Map<number, any[]>();
    for (const quizTopic of quizTopics) {
      const existing = topicMap.get(quizTopic.quizId) || [];
      if (quizTopic.topic) {
        const { id, title, description, createdAt } = quizTopic.topic;
        existing.push({ id, title, description, createdAt });
      }
      topicMap.set(quizTopic.quizId, existing);
    }

    const settingsMap = new Map<number, QuizSettings>();
    for (const settings of quizSettings) {
      settingsMap.set(settings.quizId, settings);
    }

    return quizzes.map((quiz) => ({
      ...quiz,
      subjects: subjectMap.get(quiz.id) || [],
      topics: topicMap.get(quiz.id) || [],
      settings: settingsMap.get(quiz.id) || null,
    }));
  }

  async getUserQuizzes(userId: number): Promise<any> {
    const quizzesByTitle = await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoin(QuizResult, 'qr', 'qr.quizId = quiz.id')
      .select('quiz.title', 'title')
      .addSelect('COUNT(qr.id)', 'total_attempts')
      .where('quiz.createdBy = :userId', { userId })
      .groupBy('quiz.title')
      .orderBy('quiz.title', 'ASC')
      .getRawMany();

    return quizzesByTitle.map((item) => ({
      title: item.title,
      total_attempts: parseInt(item.total_attempts, 10) || 0,
    }));
  }
}
