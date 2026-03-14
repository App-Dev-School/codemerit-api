import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/utils/api-response';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationService } from './providers/notification.service';

@Controller('apis/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() dto: CreateNotificationDto): Promise<ApiResponse<any>> {
    const data = await this.notificationService.create(dto);
    return new ApiResponse('Notification created successfully.', data);
  }

  @Get()
  async findLatest(
    @Query('userId', new DefaultValuePipe(0), ParseIntPipe) userId: number,
  ): Promise<ApiResponse<any>> {
    const data = await this.notificationService.findByUserId(userId, 50);
    return new ApiResponse('Notifications fetched successfully.', data);
  }
}
