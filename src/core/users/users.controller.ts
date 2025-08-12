import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
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
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';

@Controller('apis/users')
export class UsersController {
  constructor(
    private readonly usersService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}
  @Get('me')
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    const result = await this.usersService.findOne(req.user.id);
    if (result) {
      return new ApiResponse('User Found', result);
    }
    return new ApiResponse('User not found', result);
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
    if (result && result.length > 0) {
      return new ApiResponse('Users listed successfully.', result);
    }
    return new ApiResponse('User lit not found.', null);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('profile/:username')
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.findByUsername(username);
    if (result) {
      return new ApiResponse('User found', result);
    }
    return new ApiResponse('User not found', result);
  }

  @Put('update')
  async updateUser(
    @Query('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.updateUser(userId, updateUserDto);
    return new ApiResponse('User profile updated successfully.', result);
  }

  @Put('/profile-update/:id')
  async updateUserProfile(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.userProfileService.updateProfile(
      id,
      updateProfileDto,
    );
    return new ApiResponse('User profile updated successfully.', result);
  }

  @Get(':userId')
  async findOne(
    @Param(
      'userId',
      new ParseIntPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException('User Id must be a valid number'),
      }),
    )
    userId: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.usersService.findOne(userId);
    if (result) {
      return new ApiResponse('User Found', result);
    } else {
      return new ApiResponse('User Found', result);
    }
  }

  @Delete('delete/:userId')
  async remove(
    @Param(
      'userId',
      new ParseIntPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException('User Id must be a valid number'),
      }),
    )
    userId: number,
  ): Promise<ApiResponse<any>> {
    await this.usersService.remove(userId);

    return new ApiResponse('User deleted Successful.', null);
  }
}
