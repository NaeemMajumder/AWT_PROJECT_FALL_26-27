import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AuctionService } from "@/modules/auction/auction.service";

@Injectable()
export class AuctionLifecycleJob {
  private readonly logger = new Logger(AuctionLifecycleJob.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async run() {
    try {
      const started = await this.auctionService.startDueAuctions();
      const closed = await this.auctionService.closeEndedAuctions();
      if (started > 0 || closed > 0) {
        this.logger.log("Auctions started: " + started + ", closed: " + closed);
      }
    } catch (error) {
      this.logger.error("Auction job failed", error as any);
    }
  }
}
