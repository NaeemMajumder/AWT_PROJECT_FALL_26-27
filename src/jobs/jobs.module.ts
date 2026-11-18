import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { Auction } from "../modules/auction/entities/auction.entity";
import { Bid } from "../modules/auction/entities/bid.entity";
import { Pet } from "../modules/pet/entities/pet.entity";
import { AuctionLifecycleJob } from "./auction-lifecycle.job";
import { AuctionPriceDropJob } from "./auction-price-drop.job";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Auction, Bid, Pet]),
  ],
  providers: [AuctionLifecycleJob, AuctionPriceDropJob],
})
export class JobsModule {}
