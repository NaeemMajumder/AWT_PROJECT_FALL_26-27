import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PayOrderDto } from "./dto/payment.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("payments")
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(":orderId/pay")
  async payOrder(
    @Param("orderId", ParseUUIDPipe) orderId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: PayOrderDto,
  ) {
    return await this.paymentService.payOrder(orderId, user.id, dto);
  }

  @Get(":orderId")
  async getPayment(@Param("orderId", ParseUUIDPipe) orderId: string, @CurrentUser() user: AuthUser) {
    return await this.paymentService.getPayment(orderId, user.id, user.roles);
  }
}
