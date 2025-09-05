import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { GetQuestionsByIdsDto } from './dtos/get-questions-by-ids.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionService } from './providers/question.service';

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
  async findQuestionList(): Promise<ApiResponse<any>> {
    const result = await this.service.getQuestionListForAdmin();
    return new ApiResponse(`${result.length} Question fetched.`, result);
  }

  @Put('update')
  async update(
    @Query('id') id: number,
    @Body() dto: UpdateQuestionDto,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.updateQuestion(id, dto, req.user);
    return new ApiResponse('Question updated successfully.', result);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<ApiResponse<any>> {
    const result = await this.service.findOneBySlug(slug);
    return new ApiResponse('Question Found.', result);
  }

  @Delete('delete')
  async remove(
    @Query('id') id: number,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.remove(id, req.user);

    return new ApiResponse('Question deleted successfully.', null);
  }

  @Post('fetch')
  async getQuestionsByIds(
    @Body() dto: GetQuestionsByIdsDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.getQuestionsByIds(dto);
    if (!result || result.length === 0) {
      return new ApiResponse('No questions found', null);
    }
    return new ApiResponse('Questions fetched successfully.', result);
  }
}
