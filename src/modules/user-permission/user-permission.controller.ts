import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserPermissionService } from './providers/user-permission.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

@Controller('apis/permissions')
export class UserPermissionController {
  constructor(private readonly service: UserPermissionService) {}

  @Post('grant')
  @ApiOperation({
    summary: 'Save user wise permission',
    description: 'Save per user wise find grand permission',
  })
  async grantPermission(
    @Body() dto: GrantPermissionDto,
  ): Promise<ApiResponse<any>> {
    const result: any = await this.service.grantPermission(dto);

    return new ApiResponse(`Successfully create fine granted.`, result);
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
}
