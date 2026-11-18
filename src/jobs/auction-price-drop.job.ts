import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AuctionService } from "@/modules/auction/auction.service";

@Injectable()
export class AuctionPriceDropJob {
  private readonly logger = new Logger(AuctionPriceDropJob.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async run() {
    try {
      const count = await this.auctionService.expirePriceDropOffers();
      if (count > 0) {
        this.logger.log("Price drop offers expired: " + count);
      }
    } catch (error) {
      this.logger.error("Price drop job failed", error as any);
    }
  }
}
