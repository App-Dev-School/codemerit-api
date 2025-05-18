import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TopicsService } from './providers/topics.service';
import { CreateTopicDto } from './dtos/create-topics.dto';
import { UpdateTopicDto } from './dtos/update-topics.dto';
import { ApiResponse } from 'src/common/utils/api-response';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicService: TopicsService) {}

  @Post()
  async create(
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.topicService.create(createTopicDto);
    return new ApiResponse('User Found', result);
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    const result = await this.topicService.findAll();
    return new ApiResponse('User Found', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.topicService.findOne(id);
    return new ApiResponse('User Found', result);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.topicService.update(id, updateTopicDto);
    return new ApiResponse('User Found', result);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.topicService.remove(id);
    return new ApiResponse('User Found', result);
  }
}
