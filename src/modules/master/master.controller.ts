import { Controller, Get } from '@nestjs/common';
import { MasterService } from './master.service';
import { Public } from 'src/core/auth/decorators/public.decorator';
@Public()
@Controller('apis/master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @Get('data')
    async getMasterData() {
        return this.masterService.getMasterData();
    }

    @Get('jobRoles')
    async getJobRoles() {
        return this.masterService.getJobRolesWithSubjects();
    }
}
