import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserPermissionService } from './providers/user-permission.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';

@Controller('apis/permissions')
export class UserPermissionController {
  constructor(private readonly service: UserPermissionService) { }

  @Post('grant')
  async grantPermission(@Body() dto: GrantPermissionDto) {
    return this.service.grantPermission(dto);
  }

  @Get('master-permissions')
  async masterPermissionList() {
    return this.service.masterPermissions();
  }

  @Delete('revoke')
  async revokePermission(
    @Query('id') id: number,
  ) {
    return this.service.revokePermission(id);
  }

}
