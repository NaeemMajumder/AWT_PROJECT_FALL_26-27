import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OrderService } from "@/modules/order/order.service";

@Injectable()
export class OrderExpiryJob {
  private readonly logger = new Logger(OrderExpiryJob.name);

  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async run() {
    try {
      const count = await this.orderService.expireUnpaidPetOrders();
      if (count > 0) {
        this.logger.log("Unpaid pet orders expired: " + count);
      }
    } catch (error) {
      this.logger.error("Order expiry job failed", error as any);
    }
  }
}
