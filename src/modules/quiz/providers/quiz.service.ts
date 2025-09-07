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

    // @InjectRepository(QuizTopic)
    // private quizTopicRepository: Repository<QuizTopic>,

    // @InjectRepository(QuizSubject)
    // private quizSubjectRepository: Repository<QuizSubject>,

    // @InjectRepository(QuizQuestion)
    // private quizQuestionRepository: Repository<QuizQuestion>,

    private readonly questionService: QuestionService,
    private readonly masterService: MasterService,

    private readonly dataSource: DataSource,
  ) { }

  async getQuizBySlug(slug: string): Promise<any> {
    const quiz = await this.quizRepository.findOne({ where: { slug } });

    if (!quiz) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Quiz not found.`,
      );
    }
    const quizQuestions = await this.dataSource.getRepository(QuizQuestion).find({
      where: { quizId: quiz.id },
    });
    const questionIds = quizQuestions.map(q => q.questionId);
    if (!questionIds || questionIds.length === 0) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'No questions found for this quiz.'
      );
    }
    // Use QuestionService method to get questions
    const questions = await this.questionService.getQuestionsFromQIds({
      questionIds,
      numberOfQuestions: questionIds.length,
    });
    // Attach to quiz (like in createQuiz)
    return {
      ...quiz,
      questions,
    };
  }

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    let quizCategory = '';
    if (createQuizDto?.quizType === QuizTypeEnum.UserQuiz) {
      if (
        (!createQuizDto?.subjectIds) &&
        (!createQuizDto?.topicIds)
      ) {
        throw new AppCustomException(
          HttpStatus.BAD_REQUEST, 'Please specify a job role, subjects or topics to generate a quiz.'
        );
      }
      console.log("QuizBuilder #1 createQuizDto:", createQuizDto);

      let topicIds: number[] = [];
      let subjectIds: number[] = [];
      if (createQuizDto?.topicIds) {
        topicIds = createQuizDto?.topicIds.split(',').map(id => parseInt(id.trim(), 10));
        quizCategory = 'Topic';
      }

      if (createQuizDto?.subjectIds) {
        subjectIds = createQuizDto?.subjectIds.split(',').map(id => parseInt(id.trim(), 10));
        quizCategory = 'Subject';
      }
      const ids = new GetQuestionsByIdsDto();
      console.log("QuizBuilder #2 Q-ids:", ids, quizCategory);
      ids.subjectIds = subjectIds;
      ids.topicIds = topicIds;
      ids.numberOfQuestions = 5;
      if (createQuizDto?.numQuestions && createQuizDto?.numQuestions > 0) {
        ids.numberOfQuestions = createQuizDto?.numQuestions;
      }
      console.log('Quiz generator #2:', ids);
      const questions = await this.questionService.getQuestionsByIds(ids);
      console.log("QuizBuilder #3 Fetched Questions:", questions);
      if (!questions || questions.length < 5) {
        //generate an error with custom message
        console.log('QuizBuilder #4: @NotEnoughQuestions');
        throw new AppCustomException(
          HttpStatus.NO_CONTENT,
          `Not enough questions found for the given ${quizCategory}`
        );
      }
      try {
        let title = createQuizDto.title;
        if (!title) {
          if (subjectIds && subjectIds.length > 0) {
            const subjects = await this.masterService.getSubjectListByIds(subjectIds);
            title = getTitleBySubjectIds(subjects) + ' Quiz';
          }
          if (topicIds && topicIds.length > 0) {
            const topics = await this.masterService.getTopicListByIds(topicIds);
            title = getTitleByTopicIds(topics) + ' Quiz';
          }
        }
        let quiz = new Quiz();
        quiz.title = title;
        quiz.tag = quizCategory;
        quiz.quizType = createQuizDto.quizType;
        let slug = generateSlug(title);
        const existing = await this.quizRepository.findOne({ where: { slug } });
        if (existing) {
          slug = generateUniqueSlug(title);
        }
        quiz.slug = slug;
        console.log('QuizBuilder #4: QuizToSave', quiz);
        return this.dataSource.transaction(async manager => {
          const savedQuizzes = await manager.save(Quiz, quiz);
          console.log('QuizBuilder #5: savedQuizzes', savedQuizzes);
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
          savedQuizzes['questions'] = questions;
          return savedQuizzes;
        });
      } catch (error) {
        console.log('QuizBuilder #6: ERROR', error);
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
          'Failed to save quiz. Error: ' + error.message
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
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to submit quiz result. Error: ' + error.message
      );
    }
  }


}
