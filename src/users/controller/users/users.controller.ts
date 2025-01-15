import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Put, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { TransformInterceptor } from 'src/auth/interceptors/transform.interceptor';
import { LOG } from 'src/configs/constants';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';

@ApiTags('User')
@UseInterceptors(TransformInterceptor)
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { 
        Logger.log(LOG, "UserController Init");
    }

    @ApiResponse({ status: 201, description: 'List of all users fetched sucessfully.'})
    @ApiResponse({ status: 403, description: 'Forbidden.'})
    @Get()
    getUsers() {
        return this.userService.getUser();
    }

    @UseGuards(AccessTokenGuard)
    @Put(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        //await this.userService.update(id, updateUserDto);
        try {
            await this.userService.update(id, updateUserDto);
          } catch (error) {
            throw new UnauthorizedException(
              `Looks like you could not be authenticated.`,
            );
          }
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        await this.userService.deleteUser(id);
    }
}
