import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTopicDto } from './dtos/create-topic.dto';
import { TopicsService } from './providers/topics.service';
import { GetTopicsDto } from './dtos/get-topics.dto';
import { Response } from 'express';

@Controller('topics')
export class TagsController {
  constructor(
    private readonly topicService: TopicsService,
  ) {}
    @Get('/:userId?')
    public getPosts(
      @Param('userId') userId: string,
      @Query() topicsQuery: GetTopicsDto,
    ) {
      return this.topicService.findMultipleTags(topicsQuery.topicIds);
    }
    
  @Post()
  public create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Delete()
  public async delete(@Query('id', ParseIntPipe) id: number, res: Response) {
    return await this.topicService.delete(id);
    //Debug below code and handle all validations
    /**
    try {
      const deleteAction = await this.topicService.delete(id);
      console.log("DeleteTopic1 done"+JSON.stringify(deleteAction));
      
      if(deleteAction.deleted){
        console.log("DeleteTopic1 done 1");
        const response = ApiResponse.success(null, 'Topic deleted successfully');
        return res.status(201).json(response);
      }else{
        console.log("DeleteTopic1 done 2");
        const response = ApiResponse.success(deleteAction.id, 'Error deleting Topic');
        return res.status(500).json(response);
      }
    } catch (error) {
      console.log("DeleteTopic1 ERR::"+JSON.stringify(error.constructor));
      const response = ApiResponse.success(null, 'Unexpectd Error deleting Topic');
      return res.status(500).json(response);
    }
     */
  }

  @Delete('soft-delete')
  public softDelete(@Query('id', ParseIntPipe) id: number) {
    return this.topicService.softRemove(id);
  }
}
