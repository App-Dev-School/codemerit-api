import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { Public } from 'src/core/auth/decorators/public.decorator';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';
import { QuizService } from './providers/quiz.service';
import { QuizResultService } from './providers/quiz-result.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('apis/quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizResultService: QuizResultService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Fetch one quiz by slug',
    description: 'Fetches a quiz detail and asked quiz questions ',
  })
  @Get('fetch/:slug')
  async findOne(@Param('slug') slug: string): Promise<ApiResponse<any>> {
    const result = await this.quizService.fetchQuizBySlug(slug);
    return new ApiResponse('Question Found', result);
  }

  @ApiOperation({
    summary: 'Create New Quiz',
    description:
      'Creates a new quiz (User Quiz or Standard Quiz) along with questions.',
  })
  @Post('create')
  async create(
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<ApiResponse<any>> {
    // Use the validated DTO instance directly
    const result: any = await this.quizService.createQuiz(
      createQuizDto,
      createQuizDto.userId,
    );
    console.log('QuizCreateAPI #1 result', result);
    return new ApiResponse(`${result?.message}`, result?.quiz);
  }

  @ApiOperation({
    summary: 'Submit Quiz',
    description: 'Accepts submission from a user and captures attempt details.',
  })
  @Post('submit')
  async submitQuiz(
    @Body() submitQuizDto: SubmitQuizDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.submitQuiz(submitQuizDto);
    return new ApiResponse(`Quiz submitted successfully.`, result);
  }

  @ApiOperation({
    summary: 'Get Quiz Result',
    description: 'Retrieves the quiz result by a result code.',
  })
  @Public()
  @Get('result/:resultCode')
  async getQuizResultByCode(
    @Param('resultCode') resultCode: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizResultService.getQuizResultByCode(resultCode);
    return new ApiResponse('Quiz Result Found', result);
  }

  @ApiOperation({
    summary: 'Get all published Standard quizzes with related data',
  })
  @Public()
  @Get('standard')
  async getAllStandardQuizzes(): Promise<ApiResponse<any>> {
    const result = await this.quizService.getAllStandardQuizzes();
    return new ApiResponse('Standard quizzes fetched', result);
  }

  @ApiOperation({
    summary: 'Get user created quizzes with attempt count',
  })
  @Get('user-quiz/:userId')
  async getUserQuizzes(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.getUserQuizzes(Number(userId));
    return new ApiResponse('User quizzes fetched successfully', result);
  }
}
