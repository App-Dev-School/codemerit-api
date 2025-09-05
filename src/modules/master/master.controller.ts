import { Controller, Get, Req } from '@nestjs/common';
import { MasterService } from './master.service';
import { Public } from 'src/core/auth/decorators/public.decorator';
@Public()
@Controller('apis/master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @Get('data')
    async getMasterData(@Req() req) {
        const userId = req.user?.id;
        return this.masterService.getMasterData(userId);
    }

    @Get('userQuizStats')
    async getUserStats(@Req() req) {
        const userId = req.user?.id;
        return await this.masterService.getUserQuizStats(userId);
    }

    @Get('jobRoles')
    async getJobRoles() {
        return this.masterService.getJobRolesWithSubjects();
    }
}
