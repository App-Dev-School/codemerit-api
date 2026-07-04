import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/policies/require-permission.decorator';
import { UserPermissionEnum, UserPermissionTitleEnum } from 'src/common/policies/user-permission.enum';
import { PermissionsGuard } from 'src/common/policies/permissions.guard';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateSubjectTrackDto } from './dtos/create-subject-track.dto';
import { LinkTopicsDto } from './dtos/link-topics.dto';
import { UpdateSubjectTrackDto } from './dtos/update-subject-track.dto';
import { SubjectTrackService } from './providers/subject-track.service';

const intPipe = (label: string) =>
  new ParseIntPipe({
    errorHttpStatusCode: 400,
    exceptionFactory: () => new BadRequestException(`${label} must be a valid number`),
  });

@ApiTags('Subject Tracks')
@Controller('apis/subject-tracks')
export class SubjectTrackController {
  constructor(private readonly service: SubjectTrackService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackCreate, UserPermissionTitleEnum.SubjectTrack)
  @Post('create')
  async create(@Body() dto: CreateSubjectTrackDto): Promise<ApiResponse<any>> {
    const result = await this.service.create(dto);
    return new ApiResponse(`${dto.title} created successfully.`, result);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackGet, UserPermissionTitleEnum.SubjectTrack)
  @Get('all')
  async findAll(): Promise<ApiResponse<any>> {
    const result = await this.service.findAll();
    return new ApiResponse(`${result.length} subject tracks found.`, result);
  }

  @Get('by-subject/:subjectId')
  async findBySubject(
    @Param('subjectId', intPipe('Subject ID')) subjectId: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findBySubjectId(subjectId);
    return new ApiResponse(`${result.length} tracks found for subject.`, result);
  }

  @Get(':id')
  async findOne(
    @Param('id', intPipe('Subject Track ID')) id: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findOne(id);
    return new ApiResponse('Subject track found.', result);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackUpdate, UserPermissionTitleEnum.SubjectTrack)
  @Put('update/:id')
  async update(
    @Param('id', intPipe('Subject Track ID')) id: number,
    @Body() dto: UpdateSubjectTrackDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.update(id, dto);
    return new ApiResponse('Subject track updated.', result);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackDelete, UserPermissionTitleEnum.SubjectTrack)
  @Delete('delete/:id')
  async remove(
    @Param('id', intPipe('Subject Track ID')) id: number,
  ): Promise<ApiResponse<any>> {
    await this.service.remove(id);
    return new ApiResponse('Subject track deleted.', null);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackUpdate, UserPermissionTitleEnum.SubjectTrack)
  @Post(':id/topics')
  async linkTopics(
    @Param('id', intPipe('Subject Track ID')) id: number,
    @Body() dto: LinkTopicsDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.linkTopics(id, dto);
    return new ApiResponse(`Topics linked to subject track.`, result);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission(UserPermissionEnum.SubjectTrackUpdate, UserPermissionTitleEnum.SubjectTrack)
  @Delete(':id/topics/:topicId')
  async unlinkTopic(
    @Param('id', intPipe('Subject Track ID')) id: number,
    @Param('topicId', intPipe('Topic ID')) topicId: number,
  ): Promise<ApiResponse<any>> {
    await this.service.unlinkTopic(id, topicId);
    return new ApiResponse('Topic unlinked from subject track.', null);
  }
}
