import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Auction } from "./entities/auction.entity";
import { Bid } from "./entities/bid.entity";
import { BidRevision } from "./entities/bid-revision.entity";
import { NotificationService } from "../notification/notification.service";
import { AuctionStatus } from "@/common/enums/auction.enum";
import { NotificationType } from "@/common/enums/notification-type.enum";
import {
  ANTI_SNIPING_EXTEND_MIN,
  ANTI_SNIPING_WINDOW_MIN,
  MAX_BID_EDITS,
  MAX_EXTENSIONS,
  MIN_BID_STEP,
} from "@/common/constants/auction.constants";

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepository: Repository<Bid>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async placeBid(auctionId: string, bidderId: string, amount: number) {
    return await this.saveBid(auctionId, bidderId, amount, false);
  }

  async editBid(auctionId: string, bidderId: string, amount: number) {
    return await this.saveBid(auctionId, bidderId, amount, true);
  }

  async saveBid(auctionId: string, bidderId: string, amount: number, isEdit: boolean) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const auction = await manager.findOne(Auction, {
          where: { id: auctionId },
          lock: { mode: "pessimistic_write" },
        });
        if (!auction) {
          throw new NotFoundException("Auction not found");
        }
        if (auction.status !== AuctionStatus.LIVE || !auction.end_time || new Date(auction.end_time) <= new Date()) {
          throw new ConflictException("This auction is not live");
        }
        if (auction.seller_id === bidderId) {
          throw new ForbiddenException("You can not bid on your own auction");
        }
        if (auction.highest_bidder_id === bidderId) {
          throw new ConflictException("You are already the highest bidder");
        }

        const myBid = await manager.findOne(Bid, {
          where: { auction_id: auctionId, bidder_id: bidderId },
        });
        if (isEdit && !myBid) {
          throw new NotFoundException("You have not placed a bid on this auction yet");
        }
        if (!isEdit && myBid) {
          throw new ConflictException("You already have a bid here, raise it from My bids");
        }
        if (isEdit && myBid && myBid.edit_count >= MAX_BID_EDITS) {
          throw new ConflictException("You have used all 3 edits");
        }

        let minimum = Number(auction.start_price);
        if (auction.highest_bid !== null && auction.highest_bid !== undefined) {
          minimum = Number(auction.highest_bid) + MIN_BID_STEP;
        }
        if (amount < minimum) {
          throw new ConflictException("Minimum allowed bid is BDT " + minimum);
        }

        const previousHighest = auction.highest_bidder_id;

        let bid: Bid;
        if (myBid) {
          const oldAmount = Number(myBid.amount);
          myBid.amount = amount;
          myBid.edit_count = myBid.edit_count + 1;
          bid = await manager.save(myBid);
          await manager.save(
            manager.create(BidRevision, {
              bid_id: bid.id,
              old_amount: oldAmount,
              new_amount: amount,
            }),
          );
        } else {
          bid = await manager.save(
            manager.create(Bid, {
              auction_id: auctionId,
              bidder_id: bidderId,
              amount: amount,
              edit_count: 0,
            }),
          );
        }

        auction.highest_bid = amount;
        auction.highest_bidder_id = bidderId;

        const timeLeft = new Date(auction.end_time).getTime() - Date.now();
        if (timeLeft <= ANTI_SNIPING_WINDOW_MIN * 60 * 1000 && auction.extension_count < MAX_EXTENSIONS) {
          auction.end_time = new Date(new Date(auction.end_time).getTime() + ANTI_SNIPING_EXTEND_MIN * 60 * 1000);
          auction.extension_count = auction.extension_count + 1;
        }
        await manager.save(auction);

        return { bid: bid, auction: auction, previousHighest: previousHighest };
      });

      if (result.previousHighest) {
        await this.notificationService.notify(
          result.previousHighest,
          NotificationType.OUTBID,
          "Someone placed a higher bid. The new minimum bid is BDT " + (amount + MIN_BID_STEP),
          auctionId,
        );
      }

      return {
        message: isEdit ? "Bid raised" : "Bid placed",
        amount: amount,
        edits_left: MAX_BID_EDITS - result.bid.edit_count,
        minimum_next_bid: amount + MIN_BID_STEP,
        end_time: result.auction.end_time,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyBids(userId: string) {
    try {
      const bids = await this.bidRepository.find({
        where: { bidder_id: userId },
        relations: ["auction", "auction.pet"],
        order: { updated_at: "DESC" },
      });

      return bids.map((bid) => ({
        id: bid.id,
        auction_id: bid.auction_id,
        pet_title: bid.auction.pet.title,
        my_amount: Number(bid.amount),
        edits_left: MAX_BID_EDITS - bid.edit_count,
        is_highest: bid.auction.highest_bidder_id === userId,
        current_highest_bid: bid.auction.highest_bid ? Number(bid.auction.highest_bid) : null,
        auction_status: bid.auction.status,
        end_time: bid.auction.end_time,
        won: bid.auction.winner_id === userId,
      }));
    } catch (error) {
      throw error;
    }
  }
}
