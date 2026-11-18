import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, LessThan, LessThanOrEqual, Repository } from "typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { Auction } from "./entities/auction.entity";
import { Bid } from "./entities/bid.entity";
import { Pet } from "../pet/entities/pet.entity";
import { CreateAuctionDto, PriceDropDecisionDto, ReviewAuctionDto } from "./dto/auction.dto";
import { OrderService } from "../order/order.service";
import { NotificationService } from "../notification/notification.service";
import { AuctionStatus } from "@/common/enums/auction.enum";
import { ListingType, PetStatus } from "@/common/enums/pet.enum";
import { OrderSource } from "@/common/enums/order.enum";
import { NotificationType } from "@/common/enums/notification-type.enum";
import { MIN_BID_STEP, MIN_START_PRICE, PRICE_DROP_AMOUNT, PRICE_DROP_REPLY_HOURS } from "@/common/constants/auction.constants";
import { ORDER_EXPIRED } from "@/common/constants/events.constants";
import { OrderEventPayload } from "@/common/interfaces/order-event.interface";

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    @InjectRepository(Bid) private readonly bidRepository: Repository<Bid>,
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
  ) {}

  async createAuction(sellerId: string, dto: CreateAuctionDto) {
    try {
      const pet = await this.petRepository.findOne({ where: { id: dto.pet_id } });
      if (!pet) {
        throw new NotFoundException("Pet not found");
      }
      if (pet.owner_id !== sellerId) {
        throw new ForbiddenException("You can request an auction only for your own pet");
      }
      if (pet.listing_type !== ListingType.SALE || pet.status !== PetStatus.AVAILABLE) {
        throw new BadRequestException("Only approved sale pets that are available can go to auction");
      }

      const running = await this.auctionRepository.findOne({
        where: {
          pet_id: dto.pet_id,
          status: In([AuctionStatus.REQUESTED, AuctionStatus.SCHEDULED, AuctionStatus.LIVE, AuctionStatus.AWAITING_SELLER]),
        },
      });
      if (running) {
        throw new ConflictException("This pet already has an auction");
      }

      const auction = this.auctionRepository.create({
        pet_id: dto.pet_id,
        seller_id: sellerId,
        start_price: dto.start_price,
        duration_hours: dto.duration_hours,
        status: AuctionStatus.REQUESTED,
        round_no: 1,
        extension_count: 0,
      });
      return await this.auctionRepository.save(auction);
    } catch (error) {
      throw error;
    }
  }

  async getAuctionRequests() {
    try {
      return await this.auctionRepository.find({
        where: { status: AuctionStatus.REQUESTED },
        relations: ["pet"],
        order: { created_at: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async reviewAuction(id: string, adminId: string, dto: ReviewAuctionDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const auction = await manager.findOne(Auction, {
          where: { id: id },
          lock: { mode: "pessimistic_write" },
        });
        if (!auction) {
          throw new NotFoundException("Auction not found");
        }
        if (auction.status !== AuctionStatus.REQUESTED) {
          throw new ConflictException("Only requested auctions can be reviewed");
        }

        if (dto.decision === "rejected") {
          auction.status = AuctionStatus.REJECTED;
          auction.approved_by = adminId;
          return await manager.save(auction);
        }

        const pet = await manager.findOne(Pet, {
          where: { id: auction.pet_id },
          lock: { mode: "pessimistic_write" },
        });
        if (!pet || pet.status !== PetStatus.AVAILABLE) {
          throw new ConflictException("This pet is not available anymore");
        }

        let start = new Date();
        if (dto.start_time) {
          start = new Date(dto.start_time);
          if (start.getTime() < Date.now() - 60 * 1000) {
            throw new BadRequestException("Start time can not be in the past");
          }
        }

        auction.status = AuctionStatus.SCHEDULED;
        auction.start_time = start;
        auction.end_time = new Date(start.getTime() + Number(auction.duration_hours) * 60 * 60 * 1000);
        auction.approved_by = adminId;
        await manager.save(auction);

        pet.status = PetStatus.IN_AUCTION;
        await manager.save(pet);

        return auction;
      });
    } catch (error) {
      throw error;
    }
  }

  async getAuctions() {
    try {
      const auctions = await this.auctionRepository.find({
        where: { status: In([AuctionStatus.LIVE, AuctionStatus.SCHEDULED]) },
        relations: ["pet"],
        order: { end_time: "ASC" },
      });

      const list = [];
      for (const auction of auctions) {
        list.push(await this.publicView(auction));
      }
      return list;
    } catch (error) {
      throw error;
    }
  }

  async getAuction(id: string) {
    try {
      const auction = await this.auctionRepository.findOne({
        where: { id: id },
        relations: ["pet"],
      });
      if (!auction) {
        throw new NotFoundException("Auction not found");
      }
      return await this.publicView(auction);
    } catch (error) {
      throw error;
    }
  }

  async getMyAuctions(sellerId: string) {
    try {
      const auctions = await this.auctionRepository.find({
        where: { seller_id: sellerId },
        relations: ["pet"],
        order: { created_at: "DESC" },
      });

      const list = [];
      for (const auction of auctions) {
        const view: any = await this.publicView(auction);
        view.offer_price = auction.offer_price ? Number(auction.offer_price) : null;
        view.offer_expires_at = auction.offer_expires_at;
        view.winner_id = auction.winner_id;
        list.push(view);
      }
      return list;
    } catch (error) {
      throw error;
    }
  }

  async publicView(auction: Auction) {
    const bidderCount = await this.bidRepository.count({ where: { auction_id: auction.id } });

    let highest = null;
    let minimumNext = Number(auction.start_price);
    if (auction.highest_bid !== null && auction.highest_bid !== undefined) {
      highest = Number(auction.highest_bid);
      minimumNext = highest + MIN_BID_STEP;
    }

    return {
      id: auction.id,
      pet: auction.pet,
      round_no: auction.round_no,
      start_price: Number(auction.start_price),
      current_highest_bid: highest,
      minimum_next_bid: minimumNext,
      bidder_count: bidderCount,
      start_time: auction.start_time,
      end_time: auction.end_time,
      status: auction.status,
    };
  }

  async decidePriceDrop(id: string, sellerId: string, dto: PriceDropDecisionDto) {
    try {
      const auction = await this.auctionRepository.findOne({ where: { id: id } });
      if (!auction) {
        throw new NotFoundException("Auction not found");
      }
      if (auction.seller_id !== sellerId) {
        throw new ForbiddenException("Only the seller can answer this offer");
      }
      if (auction.status !== AuctionStatus.AWAITING_SELLER) {
        throw new ConflictException("There is no price drop offer for this auction");
      }
      if (!auction.offer_expires_at || new Date(auction.offer_expires_at) < new Date()) {
        throw new ConflictException("The price drop offer has expired");
      }

      if (dto.decision === "withdraw") {
        auction.status = AuctionStatus.WITHDRAWN;
        auction.offer_price = null;
        auction.offer_expires_at = null;
        await this.auctionRepository.save(auction);
        await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.AVAILABLE });
        return auction;
      }

      auction.start_price = Number(auction.offer_price);
      auction.round_no = auction.round_no + 1;
      auction.status = AuctionStatus.SCHEDULED;
      auction.start_time = new Date();
      auction.end_time = new Date(Date.now() + Number(auction.duration_hours) * 60 * 60 * 1000);
      auction.extension_count = 0;
      auction.highest_bid = null;
      auction.highest_bidder_id = null;
      auction.offer_price = null;
      auction.offer_expires_at = null;
      return await this.auctionRepository.save(auction);
    } catch (error) {
      throw error;
    }
  }

  async startDueAuctions() {
    const due = await this.auctionRepository.find({
      where: { status: AuctionStatus.SCHEDULED, start_time: LessThanOrEqual(new Date()) },
    });
    for (const auction of due) {
      await this.auctionRepository.update(
        { id: auction.id, status: AuctionStatus.SCHEDULED },
        { status: AuctionStatus.LIVE },
      );
    }
    return due.length;
  }

  async closeEndedAuctions() {
    const ended = await this.auctionRepository.find({
      where: { status: AuctionStatus.LIVE, end_time: LessThanOrEqual(new Date()) },
    });
    for (const item of ended) {
      await this.closeAuction(item.id);
    }
    return ended.length;
  }

  async closeAuction(id: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const auction = await manager.findOne(Auction, {
        where: { id: id },
        lock: { mode: "pessimistic_write" },
      });
      if (!auction || auction.status !== AuctionStatus.LIVE) {
        return null;
      }
      if (!auction.end_time || new Date(auction.end_time) > new Date()) {
        return null;
      }

      if (auction.highest_bidder_id) {
        auction.status = AuctionStatus.ENDED;
        auction.winner_id = auction.highest_bidder_id;
        await manager.save(auction);

        await manager.update(Pet, { id: auction.pet_id }, { status: PetStatus.RESERVED });

        await this.orderService.createPetOrder(
          {
            buyerId: auction.winner_id,
            sellerId: auction.seller_id,
            petId: auction.pet_id,
            amount: Number(auction.highest_bid),
            source: OrderSource.AUCTION,
            sourceId: auction.id,
          },
          manager,
        );
        return { auction: auction, type: "won" };
      }

      const nextPrice = Number(auction.start_price) - PRICE_DROP_AMOUNT;
      if (nextPrice >= MIN_START_PRICE) {
        auction.status = AuctionStatus.AWAITING_SELLER;
        auction.offer_price = nextPrice;
        auction.offer_expires_at = new Date(Date.now() + PRICE_DROP_REPLY_HOURS * 60 * 60 * 1000);
        await manager.save(auction);
        return { auction: auction, type: "offer" };
      }

      auction.status = AuctionStatus.UNSOLD;
      await manager.save(auction);
      await manager.update(Pet, { id: auction.pet_id }, { status: PetStatus.AVAILABLE });
      return { auction: auction, type: "unsold" };
    });

    if (!result) {
      return;
    }

    if (result.type === "won") {
      await this.notificationService.notify(
        result.auction.winner_id as string,
        NotificationType.AUCTION_WON,
        "You won the auction with BDT " + Number(result.auction.highest_bid) + ". Please pay in time.",
        result.auction.id,
      );
    }
    if (result.type === "offer") {
      await this.notificationService.notify(
        result.auction.seller_id,
        NotificationType.NO_BID_OFFER,
        "Nobody bid on your auction. Do you want to run it again at BDT " + result.auction.offer_price + "?",
        result.auction.id,
      );
    }
  }

  async expirePriceDropOffers() {
    const expired = await this.auctionRepository.find({
      where: { status: AuctionStatus.AWAITING_SELLER, offer_expires_at: LessThan(new Date()) },
    });
    for (const auction of expired) {
      auction.status = AuctionStatus.WITHDRAWN;
      auction.offer_price = null;
      auction.offer_expires_at = null;
      await this.auctionRepository.save(auction);
      await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.AVAILABLE });
    }
    return expired.length;
  }

  @OnEvent(ORDER_EXPIRED)
  async handleOrderExpired(payload: OrderEventPayload) {
    if (payload.source !== OrderSource.AUCTION) {
      return;
    }
    await this.auctionRepository.update(
      { id: payload.sourceId, status: AuctionStatus.ENDED },
      { status: AuctionStatus.UNSOLD },
    );
  }
}
