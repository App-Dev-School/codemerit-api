import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AppNotificationService } from './providers/notification.service';

@Controller('api/notification')
export class AppNotificationController {
  constructor(private readonly notificationService: AppNotificationService) { }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: number) {
    return this.notificationService.getById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.notificationService.delete(id);
  }
}
