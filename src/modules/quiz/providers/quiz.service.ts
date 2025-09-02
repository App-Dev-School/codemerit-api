import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { CreateQuizDto } from '../dtos/create-quiz.dto';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionService } from 'src/modules/question/providers/question.service';
import { GetQuestionsByIdsDto } from 'src/modules/question/dtos/get-questions-by-ids.dto';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { generateSlug, generateUniqueSlug } from 'src/common/utils/slugify.util';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { MasterService } from 'src/modules/master/master.service';
import { generate6DigitNumber, getTitleBySubjectIds, getTitleByTopicIds } from 'src/common/utils/common-functions';
import { SubmitQuizDto } from '../dtos/submit-quiz.dto';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,

    @InjectRepository(QuizTopic)
    private quizTopicRepository: Repository<QuizTopic>,

    @InjectRepository(QuizSubject)
    private quizSubjectRepository: Repository<QuizSubject>,

    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,

    private readonly questionService: QuestionService,
    private readonly masterService: MasterService,

    private readonly dataSource: DataSource,
  ) { }

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {

    if (createQuizDto?.quizType === QuizTypeEnum.UserQuiz) {
      if (
        (!createQuizDto?.subjectIds) &&
        (!createQuizDto?.jobIds) &&
        (!createQuizDto?.topicIds)
      ) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST, 'For User Quiz, at least one of subjectIds, jobIds, or topicIds must be provided.'
        );
      }

      let topicIds: number[] = [];
      let subjectIds: number[] = [];
      let jobIds: number[] = [];
      if (createQuizDto?.topicIds) {
        topicIds = createQuizDto?.topicIds.split(',').map(id => parseInt(id.trim(), 10));
      }

      if (createQuizDto?.subjectIds) {
        subjectIds = createQuizDto?.subjectIds.split(',').map(id => parseInt(id.trim(), 10));
      }

      if (createQuizDto?.jobIds) {
        jobIds = createQuizDto?.jobIds.split(',').map(id => parseInt(id.trim(), 10));
      }

      const ids = new GetQuestionsByIdsDto();
      ids.subjectIds = subjectIds;
      ids.jobIds = jobIds;
      ids.topicIds = topicIds;
      const questions = await this.questionService.getQuestionsByIds(ids);
      if (!questions || questions.length < 5) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST,
          'Minimum 5 questions must be provided.'
        );
      }
      try {
        let title = '';
        if (subjectIds && subjectIds.length > 0) {
          const subjects = await this.masterService.getSubjectListByIds(subjectIds);
          title = getTitleBySubjectIds(subjects);
        }
        if (topicIds && topicIds.length > 0) {
          const topics = await this.masterService.getTopicListByIds(topicIds);
          title = getTitleByTopicIds(topics);
        }
        let quiz = new Quiz();
        quiz.title = title;
        quiz.quizType = createQuizDto.quizType;
        let slug = generateSlug(title);
        const existing = await this.quizRepository.findOne({ where: { slug } });
        if (existing) {
          slug = generateUniqueSlug(title);
        }
        quiz.slug = slug;
        return this.dataSource.transaction(async manager => {
          const savedQuizzes = await manager.save(Quiz, quiz);

          let quizQuestion: QuizQuestion[] = [];
          let quizSubject: QuizSubject[] = [];
          let quizTopic: QuizTopic[] = [];
          for (const question of questions) {
            let quizQuestionItem = new QuizQuestion();
            quizQuestionItem.quizId = savedQuizzes.id;
            quizQuestionItem.questionId = question.id;
            quizQuestion.push(quizQuestionItem);
          }

          await manager.save(QuizQuestion, quizQuestion);
          if (subjectIds && subjectIds.length > 0) {
            for (const id of subjectIds) {

              let quizSubjectItem = new QuizSubject();
              quizSubjectItem.quizId = savedQuizzes.id;
              quizSubjectItem.subjectId = id;
              quizSubject.push(quizSubjectItem);
            }
            await manager.save(QuizSubject, quizSubject);
          }
          if (topicIds && topicIds.length > 0) {

            for (const id of topicIds) {
              let quizTopicItem = new QuizTopic();
              quizTopicItem.quizId = savedQuizzes.id;
              quizTopicItem.topicId = id;
              quizTopic.push(quizTopicItem);
            }
            await manager.save(QuizTopic, quizTopic);
          }
          return savedQuizzes;
        });
      } catch (error) {
        throw new AppCustomException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to save quiz and questions: ' + error.message
        );
      }
    }

    if (createQuizDto?.quizType === QuizTypeEnum.Standrad) {
      const questionIds = createQuizDto?.questionIds.split(',').map(id => parseInt(id.trim(), 10));
      if (!questionIds || questionIds.length < 5) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST, 'For Standard quiz type, at least 5 question must be provided.'
        );
      }
      try {
        let quiz = new Quiz();
        quiz.title = createQuizDto?.title;
        quiz.quizType = createQuizDto?.quizType;
        quiz.description = createQuizDto?.description;
        quiz.isPublished = createQuizDto?.isPublished;
        quiz.shortDesc = createQuizDto?.shortDesc;
        quiz.tag = createQuizDto?.tag;
        quiz.label = createQuizDto?.label;
        let slug = generateSlug(createQuizDto?.title);
        const existing = await this.quizRepository.findOne({ where: { slug } });
        if (existing) {
          slug = generateUniqueSlug(createQuizDto?.title);
        }
        quiz.slug = slug;
        return this.dataSource.transaction(async manager => {
          const savedQuizzes = await manager.save(Quiz, quiz);

          let quizQuestion: QuizQuestion[] = [];
          for (const questionId of questionIds) {
            let quizQuestionItem = new QuizQuestion();
            quizQuestionItem.quizId = savedQuizzes.id;
            quizQuestionItem.questionId = questionId;
            quizQuestion.push(quizQuestionItem);
          }

          await manager.save(QuizQuestion, quizQuestion);

          return savedQuizzes;
        });
      } catch (error) {
        throw new AppCustomException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to save quiz and questions: ' + error.message
        );
      }
    }

    return null;
  }
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

        await manager.save(QuizResult, result);
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

        return null;
      });
    } catch (error) {
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to save quiz and questions: ' + error.message
      );
    }
  }
}
