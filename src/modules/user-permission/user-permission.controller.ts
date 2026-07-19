import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserPermissionService } from './providers/user-permission.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RequestPermissionDto } from './dto/request-permission.dto';
import { ReviewPermissionRequestDto } from './dto/review-permission-request.dto';
import { SetRequestableDto } from './dto/set-requestable.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { AdminOrLearningAdminGuard } from 'src/common/policies/admin-or-learning-admin.guard';
import { PermissionRequestStatusEnum } from 'src/common/enum/permission-request-status.enum';

@Controller('apis/permissions')
export class UserPermissionController {
  constructor(private readonly service: UserPermissionService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post('grant')
  @ApiOperation({
    summary: 'Save user wise permission',
    description: 'Save per user wise find grand permission',
  })
  async grantPermission(
    @Body() dto: GrantPermissionDto,
  ): Promise<ApiResponse<any>> {
    const result: any = await this.service.grantPermission(dto);

    return new ApiResponse(
      `Permission(s) granted successfully to the user.`,
      result,
    );
  }

  @Get('master-permissions')
  @ApiOperation({
    summary: 'Fetch Master permission',
    description: 'Get all master permission list',
  })
  async masterPermissionList(): Promise<ApiResponse<any>> {
    const result = await this.service.masterPermissions();
    if (result) {
      return new ApiResponse(`Successfully found permission list.`, result);
    }
    return new ApiResponse(`No permission list available.`, null);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post(':id/requestable')
  @ApiOperation({
    summary: 'Mark a permission requestable or not',
    description: 'Admin only. Controls whether users see this permission in their self-service request list.',
  })
  async setRequestable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRequestableDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.setRequestable(id, dto.isRequestable);
    return new ApiResponse('Permission updated successfully.', result);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete('revoke')
  @ApiOperation({
    summary: 'Revoke user wise permission',
    description: 'Revoke user wise find grand permission',
  })
  async revokePermission(
    @Query('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.revokePermission(id);
    if (result) {
      return new ApiResponse(
        `Successfully revoke the permission for id: ${id}.`,
        result,
      );
    }
    return new ApiResponse(
      `Failed to revoke the permission with id: ${id}.`,
      result,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('user-permissions')
  @ApiOperation({
    summary: 'List all user permissions',
    description: 'Get list of all user permissions (admin only)',
  })
  async getUserPermissions(): Promise<ApiResponse<any>> {
    const result = await this.service.getAllUserPermissions();
    return new ApiResponse('User permissions fetched successfully.', result);
  }

  @Get('requestable')
  @ApiOperation({
    summary: 'List self-service requestable permissions',
    description: 'Permissions marked isRequestable/isVisible, flagged with whether the current user already holds or has a pending request for each',
  })
  async getRequestablePermissions(@Req() req: any): Promise<ApiResponse<any>> {
    const result = await this.service.getRequestablePermissions(req.user.id);
    return new ApiResponse('Requestable permissions fetched successfully.', result);
  }

  @Post('request')
  @ApiOperation({
    summary: 'Request a permission',
    description: 'Submit a self-service request (with a comment) for a permission marked isRequestable',
  })
  async requestPermission(
    @Req() req: any,
    @Body() dto: RequestPermissionDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.requestPermission(req.user.id, dto);
    return new ApiResponse('Permission request submitted successfully.', result);
  }

  @Get('my-requests')
  @ApiOperation({
    summary: 'Track my own permission requests',
    description: 'The current user\'s own requests only (any status) — not a grant; check the status field.',
  })
  async listMyPermissionRequests(
    @Req() req: any,
    @Query('status') status?: PermissionRequestStatusEnum,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.listMyPermissionRequests(req.user.id, status);
    return new ApiResponse('Your permission requests fetched successfully.', result);
  }

  @UseGuards(AdminOrLearningAdminGuard)
  @Get('requests')
  @ApiOperation({
    summary: 'List permission requests',
    description: 'Admin or Role:LearningAdmin only. Optionally filter by status (PENDING/APPROVED/REJECTED).',
  })
  async listPermissionRequests(
    @Query('status') status?: PermissionRequestStatusEnum,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.listPermissionRequests(status);
    return new ApiResponse('Permission requests fetched successfully.', result);
  }

  @UseGuards(AdminOrLearningAdminGuard)
  @Post('requests/:id/approve')
  @ApiOperation({
    summary: 'Approve a permission request',
    description: 'Admin or Role:LearningAdmin only. Grants the permission and marks the request approved.',
  })
  async approvePermissionRequest(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewPermissionRequestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.approveRequest(id, req.user.id, dto.reviewComment);
    return new ApiResponse('Permission request approved.', result);
  }

  @UseGuards(AdminOrLearningAdminGuard)
  @Post('requests/:id/reject')
  @ApiOperation({
    summary: 'Reject a permission request',
    description: 'Admin or Role:LearningAdmin only.',
  })
  async rejectPermissionRequest(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewPermissionRequestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.rejectRequest(id, req.user.id, dto.reviewComment);
    return new ApiResponse('Permission request rejected.', result);
  }
}
