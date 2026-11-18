import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuctionModule } from "@/modules/auction/auction.module";
import { OrderModule } from "@/modules/order/order.module";
import { AuctionLifecycleJob } from "./auction-lifecycle.job";
import { AuctionPriceDropJob } from "./auction-price-drop.job";
import { OrderExpiryJob } from "./order-expiry.job";

@Module({
  imports: [ScheduleModule.forRoot(), AuctionModule, OrderModule],
  providers: [AuctionLifecycleJob, AuctionPriceDropJob, OrderExpiryJob],
})
export class JobsModule {}
