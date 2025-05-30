import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './providers/users.service';
import { UserRoleEnum } from './enums/user-roles.enum';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiResponse } from 'src/common/utils/api-response';

@Controller('apis/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    const result = await this.usersService.findOne(req.user.id);
    return new ApiResponse('User Found', result);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  async getAllUsers(): Promise<ApiResponse<any>> {
    const result = await this.usersService.findAll();
    return new ApiResponse('User List found', result);
  }

  @Put('update/:userId')
  async updateProfile(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
    );
    return new ApiResponse('Succesfully updated user profile', result);
  }
}
