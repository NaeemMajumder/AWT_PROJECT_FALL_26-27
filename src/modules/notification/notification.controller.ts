import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationQueryDto } from "./dto/notification.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("notifications")
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("my")
  async getMy(@CurrentUser() user: AuthUser, @Query() query: NotificationQueryDto) {
    return await this.notificationService.getMyNotifications(user.id, query.unread_only);
  }

  @Patch(":id/read")
  async markAsRead(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.notificationService.markAsRead(id, user.id);
  }
}
