import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserPermissionService } from './providers/user-permission.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('apis/permissions')
export class UserPermissionController {
  constructor(private readonly service: UserPermissionService) { }

  @Post('grant')
  @ApiOperation({ summary: 'Save user wise permission', description: 'Save per user wise find grand permission' })
  async grantPermission(@Body() dto: GrantPermissionDto): Promise<ApiResponse<any>> {
    const result: any = await this.service.grantPermission(dto);

    return new ApiResponse(`Successfully create fine granted for ${result.firstName} ${result.lastName}.`, result);
  }

  @Get('master-permissions')
  @ApiOperation({ summary: 'Fetch Master permission', description: 'Get all master permission list' })
  async masterPermissionList(): Promise<ApiResponse<any>> {
    const result = await this.service.masterPermissions();
    if (result) {
      return new ApiResponse(`Successfully found permission list.`, result);
    }
    return new ApiResponse(`No permission list available.`, null);
  }

  @Delete('revoke')
  @ApiOperation({ summary: 'Revoke user wise permission', description: 'Revoke user wise find grand permission' })
  async revokePermission(
    @Query('id') id: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.revokePermission(id);
    if (result) {
      return new ApiResponse(`Successfully revoke the permission for id: ${id}.`, result);
    }
    return new ApiResponse(`Failed to revoke the permission with id: ${id}.`, result);
  }
}
