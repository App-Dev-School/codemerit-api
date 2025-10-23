import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNotificationDto } from "../dto/create-notification.dto";
import { AppNotification } from "src/common/typeorm/entities/app-notification.entity";
import { AppCustomException } from "src/common/exceptions/app-custom-exception.filter";


@Injectable()
export class AppNotificationService {
  constructor(
    @InjectRepository(AppNotification)
    private readonly notificationRepository: Repository<AppNotification>,
  ) { }

  async create(dto: CreateNotificationDto): Promise<AppNotification> {
    const notification = this.notificationRepository.create(dto);
    return this.notificationRepository.save(notification);
  }

  async getById(id: number): Promise<AppNotification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        `Notification with ID ${id} not found`,
      );
    }
    return notification;
  }

  async getByUserId(id: number): Promise<AppNotification[]> {
    const notification = await this.notificationRepository.find({ where: { userId: id } });
    if (!notification) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        `Notification with ID ${id} not found`,
      );
    }
    return notification;
  }

  async delete(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        `Notification with ID ${id} not found`,
      );
    }
  }

}
