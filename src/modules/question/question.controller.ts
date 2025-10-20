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
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { GetQuestionsByIdsDto } from './dtos/get-questions-by-ids.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionService } from './providers/question.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/policies/permissions.guard';
import { RequirePermission } from 'src/common/policies/require-permission.decorator';
import { UserPermissionEnum, UserPermissionTitleEnum } from 'src/common/policies/user-permission.enum';

@Controller('apis/question')
export class QuestionController {
  constructor(private readonly service: QuestionService) { }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.QuestionAuthorCreate, UserPermissionTitleEnum.Question)
  @Post('create')
  async create(@Body() data: CreateQuestionDto): Promise<ApiResponse<any>> {
    console.log('called controller');

    const result = await this.service.createQuestion(data);
    return new ApiResponse('Question created successfully', result);
  }

  @Get()
  async findQuestionList(
    @Query('fullData') fullData?: string,
    @Query('subjectId') subjectId?: string,
    @Query('topicId') topicId?: string,
    @Query('fetchAll') fetchAll?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<any>> {

    const isFullData = fullData === 'true' || fullData === '1';
    const subjectIdNum = subjectId ? parseInt(subjectId, 10) : undefined;
    const topicIdNum = topicId ? parseInt(topicId, 10) : undefined;
    const fetchAllFlag = fetchAll === 'true' || fetchAll === '1';
    const limitNum = limit ? parseInt(limit, 10) : 100; // default 100

    const result = await this.service.getQuestionListForAdmin(
      isFullData,
      subjectIdNum,
      topicIdNum,
      fetchAllFlag,
      limitNum,
    );
    //?subjectId=5&fetchAll=true - Fetch all questions for a subject
    //?fullData=true&limit=5 - Fetch first 5 questions with full options and topics
    //?fullData=true&topicId=11
    return new ApiResponse(`${result.length} Question(s) fetched.`, result);
  }


  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.QuestionAuthorUpdate, UserPermissionTitleEnum.Question)
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

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.QuestionAuthorDelete, UserPermissionTitleEnum.Question)
  @Delete('delete')
  async remove(
    @Query('id') id: number,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.remove(id, req.user);

    return new ApiResponse('Question deleted successfully.', null);
  }

  //For end-users
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
