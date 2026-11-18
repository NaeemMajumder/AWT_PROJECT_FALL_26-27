import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CheckoutDto, OrderQueryDto } from "./dto/order.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("orders")
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("checkout")
  async checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return await this.orderService.checkout(user.id, dto);
  }

  @Get("my")
  async getMyOrders(@CurrentUser() user: AuthUser, @Query() query: OrderQueryDto) {
    return await this.orderService.getMyOrders(user.id, query);
  }

  @Get("sales")
  async getMySales(@CurrentUser() user: AuthUser) {
    return await this.orderService.getMySales(user.id);
  }

  @Get(":id")
  async getOrder(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.orderService.getOrderForUser(id, user.id, user.roles);
  }

  @Patch(":id/cancel")
  async cancelOrder(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.orderService.cancelMyOrder(id, user.id);
  }
}
