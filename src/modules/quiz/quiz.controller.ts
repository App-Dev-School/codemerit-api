import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { QuizService } from './providers/quiz.service';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';

@Controller('apis/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('create')
  async create(
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.createQuiz(createQuizDto);
    console.log("QuizCreateAPI #1 result", result);

    return new ApiResponse(`${result.title} added successfully.`, result);
  }

  @Post('submit')
  async submitQuiz(
    @Body() submitQuizDto: SubmitQuizDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.submitQuiz(submitQuizDto);

    return new ApiResponse(`successfully submitted.`, result);
  }

  // @Get('/all')
  // async findAll(): Promise<ApiResponse<any>> {
  //   const result = await this.quizService.createQuiz(createQuizDto);
  //   return new ApiResponse('Quizzes Found', result);
  // }

  // @Get(':quizId')
  // async findOne(
  //   @Param('quizId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Quiz Id must be a valid number') }))
  //   quizId: number): Promise<ApiResponse<any>> {
  //   const result = await this.quizService.findOne(quizId);
  //   return new ApiResponse('Quiz Found', result);
  // }

  // @Put('update/:quizId')
  // async update(
  //   @Param('quizId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Quiz Id must be a valid number') }))
  //   quizId: number,
  //   @Body() updateQuizDto: UpdateQuizDto,
  // ): Promise<ApiResponse<any>> {
  //   const result = await this.quizService.update(quizId, updateQuizDto);
  //   return new ApiResponse(`${updateQuizDto} updated successfully.`, result);
  // }

  // @Delete('delete/:quizId')
  // async remove(
  //   @Param('quizId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Quiz Id must be a valid number') }))
  //   quizId: number
  // ): Promise<ApiResponse<any>> {
  //    await this.quizService.remove(quizId);
  //   return new ApiResponse('Quiz deleted.', null);
  // }

  // @Public()
  // @Get(':quizId')
  // async findAllTopicListBySubjectId(@Param('quizId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Quiz Id must be a valid number') }))
  // quizId: number): Promise<ApiResponse<any>> {
  //   const result = await this.quizService.findAllBySubjectId(quizId);
  //   return new ApiResponse(`${result.length} quizzes found in Subject ${result[0].subjectName}`, result);
  // }
}
