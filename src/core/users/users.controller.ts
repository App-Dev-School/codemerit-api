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
