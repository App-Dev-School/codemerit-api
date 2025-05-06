import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './providers/users.service';
import { UserRoleEnum } from './enums/user-roles.enum';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Put('update/:userId')
  async updateProfile(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
