import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionService } from './providers/question.service';
import { ApiResponse } from 'src/common/utils/api-response';

@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Post()
  async create(@Body() data: Partial<Question>): Promise<ApiResponse<any>> {
    const result = await this.service.create(data);
    return new ApiResponse('Successfully create question', result);
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    const result = await this.service.findAll();
    return new ApiResponse('Question list Found', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.service.findOne(id);
    return new ApiResponse(`Question Found for id ${id}`, result);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Question>,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.update(id, data);
    return new ApiResponse('Successfully updated question', result);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.service.remove(id);
    return new ApiResponse('Successfully removed question', result);
  }
}
