import {
    Controller,
    Get,
    UseGuards
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { AdminService } from './providers/admin.service';


@Controller('apis/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}
  
  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('dashboard')
  async getAdminDash(): Promise<ApiResponse<any>> {
    const result = await this.adminService.getDashboardSummary();
    if (result) {
      return new ApiResponse('Data fetched successfully.', result);
    }
    return new ApiResponse('Error fetching data.', null);
  }
}
