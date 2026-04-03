import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { LmsService } from './providers/lms.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('apis/lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoleEnum.USER)
  @Get('dashboard')
  async getAdminDash(@Request() req: any): Promise<ApiResponse<any>> {
    const result = await this.lmsService.getDashboardSummary(req.user?.id);
    if (result) {
      return new ApiResponse('Data fetched successfully.', result);
    }
    return new ApiResponse('Error fetching data.', null);
  }
}
