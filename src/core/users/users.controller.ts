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
import { UserService } from './providers/user.service';
import { UserRoleEnum } from './enums/user-roles.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiResponse } from 'src/common/utils/api-response';
import { UserProfileService } from './providers/user-profile.service';

@Controller('apis/users')
export class UsersController {
  constructor(
    private readonly usersService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}
  @Get('me')
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    const result = await this.usersService.findOne(req.user.id);
    return new ApiResponse('User Found', result);
  }

  //View Profile API for Admin
  //create one more endpoint: /profile/{userName} like above end point that can be used by admin only
  //to view any user profile based on the username
  //Refer second last commit to check the profile entity
  //that lists the user profile along with the profile.
  //sensitive fields like password, token etc. should not be revealed.
  //the profile should be attached with login & in data.profile
  //Additional : Implement slugify use for username during registration. Existing utility in project. See usage.

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  async getAllUsers(): Promise<ApiResponse<any>> {
    const result = await this.usersService.findUserList();
    return new ApiResponse('User List found', result);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('profile/:username')
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.findByUsername(username);
    return new ApiResponse('User found', result);
  }

  @Put('update/:userId')
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.updateUser(userId, updateProfileDto);
    return new ApiResponse('User profile updated successfully.', result);
  }

  @Put('/profile-update/:id')
  async updateUserProfile(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.userProfileService.updateProfile(
      id,
      updateProfileDto,
    );
    return new ApiResponse('User profile updated successfully.', result);
  }
}
