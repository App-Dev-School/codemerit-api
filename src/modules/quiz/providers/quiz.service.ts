import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { generate6DigitNumber, getTitleBySubjectIds, getTitleByTopicIds } from 'src/common/utils/common-functions';
import { generateSlug, generateUniqueSlug } from 'src/common/utils/slugify.util';
import { MasterService } from 'src/modules/master/providers/master.service';
import { GetQuestionsByIdsDto } from 'src/modules/question/dtos/get-questions-by-ids.dto';
import { QuestionService } from 'src/modules/question/providers/question.service';
import { UserQuestionService } from 'src/modules/question/providers/user-question.service';
import { DataSource, Repository } from 'typeorm';
import { CreateQuizDto } from '../dtos/create-quiz.dto';
import { SubmitQuizDto } from '../dtos/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepo: Repository<QuizQuestion>,
    private readonly userQuestionService: UserQuestionService,
    private readonly questionService: QuestionService,
    private readonly masterService: MasterService,

    private readonly dataSource: DataSource,
  ) { }

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
        'No questions found for this quiz.'
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

  async createQuiz(userId: number, createQuizDto: CreateQuizDto): Promise<Quiz> {
    console.log('quiz service called');
    console.log('QuizBuilder @createQuiz called:', createQuizDto);
    let quizCategory = '';
    if (!createQuizDto?.subjectIds?.length && !createQuizDto?.topicIds?.length) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        "Please specify at least one subject or topic to generate a quiz."
      );
    }
    console.log('QuizBuilder @createQuiz Start:', createQuizDto?.subjectIds);
    let topicIds: number[] = [];
    let subjectIds: number[] = [];

    if (createQuizDto?.topicIds) {
      const topicStr = String(createQuizDto.topicIds); // ensure it's a string
      topicIds = topicStr.split(',').map(id => parseInt(id.trim(), 10));
      quizCategory = 'Topic';
    }

    if (createQuizDto?.subjectIds) {
      const subjectStr = String(createQuizDto.subjectIds); // ensure it's a string
      subjectIds = subjectStr.split(',').map(id => parseInt(id.trim(), 10));
      quizCategory = 'Subject';
    }

    const ids = new GetQuestionsByIdsDto();
    ids.subjectIds = subjectIds;
    ids.topicIds = topicIds;
    if (createQuizDto?.numQuestions && createQuizDto?.numQuestions > 0) {
      ids.numQuestions = createQuizDto?.numQuestions;
    } else {
      ids.numQuestions = 10;
    }

    console.log('QuizBuilder @Input:', ids);
    //const questions = await this.questionService.getQuestionsByIds(ids);

    const questionObj: any = await this.userQuestionService.getUniqueQuizForQuestions(userId, ids);
    const questions = questionObj?.questions;

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
    if (!questions || questions.length == 0) {
      console.log('QuizBuilder #4: @NotEnoughQuestions', questions.length);
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Not enough questions ${questions.length} found for the given ${quizCategory}`
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
      let existingSlug = await this.quizRepository.findOne({ where: { slug } });
      while (existingSlug) {
        slug = generateUniqueSlug(title);
        existingSlug = await this.quizRepository.findOne({ where: { slug } });
      }
      quiz.slug = slug;
      //quiz.userId = userId;
      quiz.createdBy = userId;
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
        const response: any = {
          message: (questionObj?.message) ? questionObj?.message : 'Quiz created successfully.',
          quiz: savedQuizzes,
        };
        return response;
      });
    } catch (error) {
      console.log('QuizBuilder #6: ERROR', error);
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to save quiz and questions: ' + error.message
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
        'Failed to submit quiz result.'
      );
    }
  }

}
