import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { UserPermissionEnum } from 'src/common/policies/user-permission.enum';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { LmsService } from './providers/lms.service';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionService } from '../user-permission/providers/user-permission.service';

@Controller('apis/lms')
export class LmsController {
  constructor(
    private readonly lmsService: LmsService,
    private readonly userPermissionService: UserPermissionService,
  ) {}

  private async ensureLmsAccess(userId: number) {
    const permissions =
      await this.userPermissionService.findUserPermissionList(userId);

    const isLmsManager = permissions.some(
      (permission: any) =>
        Number(permission.permissionId) === 4 ||
        permission.permissionName === UserPermissionEnum.LmsManager,
    );

    if (!isLmsManager) {
      throw new AppCustomException(
        HttpStatus.FORBIDDEN,
        'You are not authorized to make this request.',
      );
    }
  }

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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoleEnum.USER)
  @Get('user-standard-quiz/:userId')
  async getUserStandardQuizzes(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    await this.ensureLmsAccess(req.user?.id);

    const result = await this.lmsService.getUserStandardQuizzes(userId);
    return new ApiResponse(
      'User standard quizzes fetched successfully.',
      result,
    );
  }
}
