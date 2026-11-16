import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Auction } from "./entities/auction.entity";
import { Bid } from "./entities/bid.entity";
import { BidRevision } from "./entities/bid-revision.entity";
import { AuctionStatus } from "../../common/enums/auction.enum";
import { MAX_BID_EDITS, MIN_BID_STEP, ANTI_SNIPING_WINDOW_MIN, ANTI_SNIPING_EXTEND_MIN, MAX_EXTENSIONS } from "../../common/constants/auction.constants";
import { Inject, Optional } from "@nestjs/common";
import { TeamANotificationsService } from "../../common/interfaces/team-a-handshake.interface";

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid) private readonly bidRepository: Repository<Bid>,
    @InjectRepository(BidRevision) private readonly revisionRepository: Repository<BidRevision>,
    private readonly dataSource: DataSource,
    @Optional() @Inject("TEAM_A_NOTIFICATIONS_SERVICE") private readonly notificationsService?: TeamANotificationsService,
  ) {}

  async placeBid(auctionId: string, bidderId: string, amount: number) {
    return await this.saveBid(auctionId, bidderId, amount, false);
  }

  async editBid(auctionId: string, bidderId: string, amount: number) {
    return await this.saveBid(auctionId, bidderId, amount, true);
  }

  private async saveBid(auctionId: string, bidderId: string, amount: number, isEdit: boolean) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const auction = await runner.manager.findOne(Auction, {
        where: { id: auctionId }, lock: { mode: "pessimistic_write" },
      });
      if (!auction) throw new NotFoundException("Auction not found");
      if (auction.status !== AuctionStatus.LIVE || !auction.end_time || auction.end_time <= new Date()) throw new ConflictException("Auction is not live");
      if (auction.seller_id === bidderId) throw new ForbiddenException("Seller cannot bid on own auction");
      if (auction.highest_bidder_id === bidderId) throw new ConflictException("You are already the highest bidder");
      const existing = await runner.manager.findOne(Bid, { where: { auction_id: auctionId, bidder_id: bidderId } });
      if (isEdit && !existing) throw new NotFoundException("Your bid was not found");
      if (!isEdit && existing) throw new ConflictException("You have already placed a bid; use edit instead");
      if (isEdit && existing!.edit_count >= MAX_BID_EDITS) throw new ConflictException("You have used all 3 bid edits");
      const previousHighestBidder = auction.highest_bidder_id;
      const minimum = auction.highest_bid === null || auction.highest_bid === undefined
        ? Number(auction.start_price)
        : Number(auction.highest_bid) + MIN_BID_STEP;
      if (Number(amount) < minimum) throw new ConflictException(`Minimum allowed bid is BDT ${minimum}`);
      if (isEdit && Number(amount) <= Number(existing!.amount)) throw new BadRequestException("A bid can only be increased");

      let bid: Bid;
      if (existing) {
        const oldAmount = Number(existing.amount);
        existing.amount = amount;
        existing.edit_count += 1;
        bid = await runner.manager.save(existing);
        await runner.manager.save(runner.manager.create(BidRevision, {
          bid_id: bid.id, old_amount: oldAmount, new_amount: amount,
        }));
      } else {
        bid = await runner.manager.save(runner.manager.create(Bid, {
          auction_id: auctionId, bidder_id: bidderId, amount, edit_count: 0,
        }));
      }
      auction.highest_bid = amount;
      auction.highest_bidder_id = bidderId;
      const remaining = auction.end_time.getTime() - Date.now();
      if (remaining <= ANTI_SNIPING_WINDOW_MIN * 60 * 1000 && auction.extension_count < MAX_EXTENSIONS) {
        auction.end_time = new Date(auction.end_time.getTime() + ANTI_SNIPING_EXTEND_MIN * 60 * 1000);
        auction.extension_count += 1;
      }
      await runner.manager.save(auction);
      await runner.commitTransaction();
      if (previousHighestBidder && previousHighestBidder !== bidderId && this.notificationsService) {
        await this.notificationsService.notify(previousHighestBidder, "outbid", "Another buyer has placed a higher bid on an auction you joined");
      }
      return { bid, minimum_next_bid: amount + MIN_BID_STEP, edits_left: MAX_BID_EDITS - bid.edit_count };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async getMyBids(userId: string) {
    const bids = await this.bidRepository.find({ where: { bidder_id: userId }, relations: ["auction", "auction.pet"] });
    return bids.map((bid) => ({
      id: bid.id, auction_id: bid.auction_id, amount: Number(bid.amount),
      edits_left: MAX_BID_EDITS - bid.edit_count,
      is_highest: bid.auction.highest_bidder_id === userId,
      auction_status: bid.auction.status, pet: bid.auction.pet,
    }));
  }
}
