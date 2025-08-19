import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { QuestionService } from './providers/question.service';
import { GetQuestionDto } from './dtos/get-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';

@Controller('apis/question')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Post('create')
  async create(@Body() data: CreateQuestionDto): Promise<ApiResponse<any>> {
    console.log('called controller');

    const result = await this.service.createQuestion(data);
    return new ApiResponse('Question created successfully', result);
  }

  @Get()
  async findQuestionList(
    @Query('subjectId') subjectId: number,
    // @Query() query: GetQuestionDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.getQuestionListForAdmin(subjectId);
    return new ApiResponse(
      `${result.length} Question fetched from ${result[0].subject}.`,
      result,
    );
  }

  @Put('update')
  async update(
    @Query('id') id: number,
    @Body() dto: UpdateQuestionDto,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.updateQuestion(id, dto, req.user);
    return new ApiResponse('Successfully updated Question', result);
  }

  @Delete('delete')
  async remove(
    @Query('id') id: number,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.remove(id, req.user);

    return new ApiResponse('Successfully deleted question', null);
  }
}
