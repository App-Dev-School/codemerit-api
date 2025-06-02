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
import { TopicsService } from './providers/topics.service';
import { CreateTopicDto } from './dtos/create-topics.dto';
import { UpdateTopicDto } from './dtos/update-topics.dto';
import { ApiResponse } from 'src/common/utils/api-response';
import { Public } from 'src/core/auth/decorators/public.decorator';

@Controller('apis/topics')
export class TopicsController {
  constructor(private readonly topicService: TopicsService) {}

  @Post('create')
  async create(
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.topicService.create(createTopicDto);
    return new ApiResponse('New topic Forms in Angular created successfully.', result);
  }

  // @Get()
  // async findAll(): Promise<ApiResponse<any>> {
  //   const result = await this.topicService.findAll();
  //   return new ApiResponse('Topics Found', result);
  // }

  // @Get(':topicId')
  // async findOne(
  //   @Param('topicId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Topic Id must be a valid number') }))
  //   topicId: number): Promise<ApiResponse<any>> {
  //   const result = await this.topicService.findOne(topicId);
  //   return new ApiResponse('Topic Found', result);
  // }

  @Put('update/:topicId')
  async update(
    @Param('topicId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Topic Id must be a valid number') }))
    topicId: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.topicService.update(topicId, updateTopicDto);
    return new ApiResponse(`Topic ${updateTopicDto.title} updated successfully`, result);
  }

  @Delete('delete/:topicId')
  async remove(
    @Param('topicId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Topic Id must be a valid number') }))
    topicId: number
  ): Promise<ApiResponse<any>> {
     await this.topicService.remove(topicId);
    return new ApiResponse('Topic Removed', null);
  }

  @Public()
  @Get(':subjectId')
  async findAllTopicListBySubjectId(@Param('subjectId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Subject Id must be a valid number') }))
  subjectId: number): Promise<ApiResponse<any>> {
    const result = await this.topicService.findAllBySubjectId(subjectId);
    return new ApiResponse(`${result.length} topics found in Subject`, result);
  }
}
