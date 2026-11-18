import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "./entities/auction.entity";
import { Bid } from "./entities/bid.entity";
import { BidRevision } from "./entities/bid-revision.entity";
import { Pet } from "../pet/entities/pet.entity";
import { AuctionController } from "./auction.controller";
import { AuctionService } from "./auction.service";
import { BidService } from "./bid.service";
import { OrderModule } from "../order/order.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid, BidRevision, Pet]), OrderModule, NotificationModule],
  controllers: [AuctionController],
  providers: [AuctionService, BidService],
  exports: [AuctionService],
})
export class AuctionModule {}
