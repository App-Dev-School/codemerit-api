import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from 'src/core/auth/jwt/optional-jwt-auth-guard';
import { AddUserSubjectsDto } from 'src/core/users/dtos/user-subject.dto';
import { MasterService } from './providers/master.service';
import { TopicAnalysisService } from './providers/topic-analysis.service';
import { SubjectAnalysisService } from './providers/subject-analysis.service';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserPermissionService } from '../user-permission/providers/user-permission.service';
@Controller('apis/master')
export class MasterController {
  constructor(
    private readonly masterService: MasterService,
    private subjectAnalyzer: SubjectAnalysisService,
    private readonly topicAnalysisProvider: TopicAnalysisService,
    private readonly userPermissionService: UserPermissionService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('data')
  async getMasterData(@Request() req: any) {
    const userId = req.user?.id;
    return this.masterService.getMasterData(userId);
  }

  @Post('userSubjects')
  async addUserSubjects(@Request() req, @Body() dto: AddUserSubjectsDto) {
    const userId = req.user.id;
    return this.masterService.addUserSubjects(userId, dto);
  }

  @Get('subjectDashboard')
  async getSubjectDashboard(@Query('slug') slug: string, @Request() req) {
    const userId = req.user?.id;
    return this.subjectAnalyzer.getSubjectDashboardBySlug(slug, userId, true);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('subjectTopicsDashboard')
  async subjectTopicsDashboard(
    @Query('subjectId') subjectId?: string,
    @Request() req?: any,
  ) {
    const subjectIdNum = subjectId ? parseInt(subjectId, 10) : undefined;
    if (subjectIdNum && subjectIdNum > 0) {
      return this.topicAnalysisProvider.getTopicStatsBySubject(
        subjectIdNum,
        req.user,
        false,
      );
    } else {
      return await this.topicAnalysisProvider.getAllTopicStats(req.user, false);
    }
    // Single topic (fast)
    //const t1 = await topicAnalysisProvider.getTopicStatsById(42, userId, true);

    // All topics in a subject (one grouped query + one batched leaderboard)
    //const list = await this.topicAnalysisProvider.getTopicStatsBySubject(7, userId, true);

    // All topics (paged)
    //const allPaged = await this.topicAnalysisProvider.getAllTopicStats(userId, false, 0, 50);
  }

  @Get('myJobDashboard')
  async getJobDashboard(@Request() req) {
    const userId = req.user?.id;
    return await this.subjectAnalyzer.getJobSubjectDashboards(userId, false);
    //getSubscribedSubjectDashboards
  }

  @Get('userQuizStats')
  async getUserStats(@Request() req) {
    const userId = req.user?.id;
    return await this.masterService.getUserQuizStats(userId);
  }

  //Already fetched by master data
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('jobRoles')
  async getJobRoles(@Request() req: any) {
    const userId = req.user?.id;
    return this.masterService.getJobRolesWithSubjects(userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('routes')
  async getRoutes(@Request() req: any) {
    const permissions = await this.userPermissionService.findUserPermissionList(
      req.user?.id,
    );
    const result = await this.masterService.getRoutesConfig(
      req.user?.role,
      permissions,
    );
    console.log('Routes for user', req.user);
    return new ApiResponse('Routes fetched successfully.', result);
  }
}
