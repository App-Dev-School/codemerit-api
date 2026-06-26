import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { UserPermissionEnum } from 'src/common/policies/user-permission.enum';
import { ApiResponse } from 'src/common/utils/api-response';
import { Public } from 'src/core/auth/decorators/public.decorator';
import { UserPermissionService } from '../user-permission/providers/user-permission.service';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { LessonService } from './providers/lesson.service';

@Controller('apis/lesson')
export class LessonController {
  constructor(
    private readonly service: LessonService,
    private readonly userPermissionService: UserPermissionService,
  ) {}

  private async ensureLmsAccess(userId: number) {
    const permissions =
      await this.userPermissionService.findUserPermissionList(userId);

    const isLmsManager = permissions.some(
      (permission: any) =>
        Number(permission.permissionId) === 4 ||
        permission.permissionName === UserPermissionEnum.LmsManager,
    );

    if (!isLmsManager) {
      throw new AppCustomException(
        HttpStatus.FORBIDDEN,
        'You are not authorized to make this request.',
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(
    @Body() data: CreateLessonDto,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    await this.ensureLmsAccess(req.user?.id);
    const result = await this.service.createLesson(data, req.user.id);
    return new ApiResponse('Lesson created successfully', result);
  }
}
