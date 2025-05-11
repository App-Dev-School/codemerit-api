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

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicService: TopicsService) {}

  @Post()
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Get()
  async findAll() {
    return this.topicService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.topicService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.update(id, updateTopicDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.topicService.remove(id);
  }
}
