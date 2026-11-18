import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Auction } from "../modules/auction/entities/auction.entity";
import { Pet } from "../modules/pet/entities/pet.entity";
import { Bid } from "../modules/auction/entities/bid.entity";
import { AuctionStatus } from "../common/enums/auction.enum";
import { PetStatus } from "../common/enums/pet.enum";
import { PRICE_DROP_AMOUNT, PRICE_DROP_REPLY_HOURS, MIN_START_PRICE } from "../common/constants/auction.constants";
import { Inject, Optional } from "@nestjs/common";
import { TeamAOrdersService, TeamANotificationsService } from "../common/interfaces/team-a-handshake.interface";

@Injectable()
export class AuctionLifecycleJob {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    @InjectRepository(Bid) private readonly bidRepository: Repository<Bid>,
    @Optional() @Inject("TEAM_A_ORDERS_SERVICE") private readonly ordersService?: TeamAOrdersService,
    @Optional() @Inject("TEAM_A_NOTIFICATIONS_SERVICE") private readonly notificationsService?: TeamANotificationsService,
  ) {}

  @Cron("* * * * *")
  async startAuctions() {
    const now = new Date();
    const due = await this.auctionRepository.createQueryBuilder("auction")
      .where("auction.status = :status", { status: AuctionStatus.SCHEDULED })
      .andWhere("auction.start_time <= :now", { now }).getMany();
    for (const auction of due) {
      auction.status = AuctionStatus.LIVE;
      await this.auctionRepository.save(auction);
    }
  }

  @Cron("* * * * *")
  async closeAuctions() {
    const now = new Date();
    const expired = await this.auctionRepository.createQueryBuilder("auction")
      .where("auction.status = :status", { status: AuctionStatus.LIVE })
      .andWhere("auction.end_time <= :now", { now }).getMany();
    for (const auction of expired) {
      if (auction.highest_bidder_id) {
        auction.status = AuctionStatus.ENDED;
        auction.winner_id = auction.highest_bidder_id;
        // Team A handshake: create the winner's pet order and start its 24-hour payment window.
        if (this.ordersService && auction.winner_id) {
          const pet = await this.petRepository.findOne({ where: { id: auction.pet_id } });
          if (pet) {
            await this.ordersService.createPetOrder({
              buyerId: auction.winner_id, sellerId: auction.seller_id,
              petId: pet.id, price: Number(auction.highest_bid),
              source: "auction", payBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
          }
        }
        if (this.notificationsService && auction.winner_id) {
          await this.notificationsService.notify(auction.winner_id, "auction_won", "You won the auction. Complete payment within 24 hours");
        }
      } else {
        const nextPrice = Number(auction.start_price) - PRICE_DROP_AMOUNT;
        if (nextPrice >= MIN_START_PRICE) {
          auction.status = AuctionStatus.AWAITING_SELLER;
          auction.offer_price = nextPrice;
          auction.offer_expires_at = new Date(Date.now() + PRICE_DROP_REPLY_HOURS * 60 * 60 * 1000);
          if (this.notificationsService) {
            await this.notificationsService.notify(auction.seller_id, "no_bid_offer", "Your auction ended without bids. You can accept the lower price or withdraw the pet");
          }
        } else {
          auction.status = AuctionStatus.UNSOLD;
          await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.AVAILABLE });
        }
      }
      await this.auctionRepository.save(auction);
    }
  }
}
