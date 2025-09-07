import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { MasterService } from './master.service';
import { Public } from 'src/core/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from 'src/core/auth/jwt/optional-jwt-auth-guard';
import { AddUserSubjectsDto } from 'src/core/users/dtos/user-subject.dto';
@Controller('apis/master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

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
    async getSubjectDashboard(
        @Query('slug') slug: string,
        @Request() req
    ) {
        const userId = req.user?.id;
        return this.masterService.getSubjectDashboardBySlug(slug, userId, true);
    }

    @Get('myJobDashboard')
    async getJobDashboard(@Request() req) {
        const userId = req.user?.id;
        return await this.masterService.getSubscribedSubjectDashboards(userId, true);
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
}
