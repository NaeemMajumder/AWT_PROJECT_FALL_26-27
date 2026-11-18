import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";
import { NotificationType } from "@/common/enums/notification-type.enum";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async notify(userId: string, type: NotificationType, message: string, auctionId?: string) {
    try {
      const notification = this.notificationRepository.create({
        user_id: userId,
        type: type,
        message: message,
        auction_id: auctionId || null,
      });
      return await this.notificationRepository.save(notification);
    } catch (error) {
      throw error;
    }
  }

  async getMyNotifications(userId: string, unreadOnly?: boolean) {
    try {
      const where: any = { user_id: userId };
      if (unreadOnly) {
        where.is_read = false;
      }
      return await this.notificationRepository.find({
        where: where,
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      const notification = await this.notificationRepository.findOne({ where: { id: id } });
      if (!notification) {
        throw new NotFoundException("Notification not found");
      }
      if (notification.user_id !== userId) {
        throw new ForbiddenException("This is not your notification");
      }
      notification.is_read = true;
      return await this.notificationRepository.save(notification);
    } catch (error) {
      throw error;
    }
  }
}
