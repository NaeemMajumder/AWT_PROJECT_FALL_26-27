import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Auction } from "./entities/auction.entity";
import { Pet } from "../pet/entities/pet.entity";
import { CreateAuctionDto, PriceDropDecisionDto, ReviewAuctionDto } from "./dto/auction.dto";
import { AuctionStatus } from "../../common/enums/auction.enum";
import { PetStatus, ListingType } from "../../common/enums/pet.enum";
import { MIN_START_PRICE, MAX_DURATION_HOURS, PRICE_DROP_AMOUNT, PRICE_DROP_REPLY_HOURS } from "../../common/constants/auction.constants";
import { Bid } from "./entities/bid.entity";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    @InjectRepository(Bid) private readonly bidRepository: Repository<Bid>,
    private readonly dataSource: DataSource,
  ) {}

  async createAuction(sellerId: string, dto: CreateAuctionDto) {
    const pet = await this.petRepository.findOne({ where: { id: dto.pet_id } });
    if (!pet) throw new NotFoundException("Pet not found");
    if (pet.owner_id !== sellerId) throw new ForbiddenException("You can request auction only for your own pet");
    if (pet.listing_type !== ListingType.SALE || pet.status !== PetStatus.AVAILABLE) throw new BadRequestException("Only available sale pets can enter an auction");
    if (Number(dto.start_price) < MIN_START_PRICE) throw new BadRequestException("Auction starting price must be at least BDT 50,000");
    if (dto.duration_hours > MAX_DURATION_HOURS) throw new BadRequestException("Auction duration cannot exceed 48 hours");
    const existing = await this.auctionRepository.findOne({ where: { pet_id: dto.pet_id, status: AuctionStatus.REQUESTED } });
    if (existing) throw new ConflictException("An auction request already exists for this pet");
    const auction = this.auctionRepository.create({
      ...dto, seller_id: sellerId, status: AuctionStatus.REQUESTED, round_no: 1, extension_count: 0,
    });
    return await this.auctionRepository.save(auction);
  }

  async reviewAuction(id: string, adminId: string, dto: ReviewAuctionDto) {
    const auction = await this.auctionRepository.findOne({ where: { id } });
    if (!auction) throw new NotFoundException("Auction not found");
    if (auction.status !== AuctionStatus.REQUESTED) throw new ConflictException("Only requested auctions can be reviewed");
    if (dto.decision === "rejected") {
      auction.status = AuctionStatus.REJECTED;
      return await this.auctionRepository.save(auction);
    }
    if (!dto.start_time) throw new BadRequestException("start_time is required for approval");
    const start = new Date(dto.start_time);
    if (start <= new Date()) throw new BadRequestException("Auction start time must be in the future");
    auction.status = AuctionStatus.SCHEDULED;
    auction.start_time = start;
    auction.end_time = new Date(start.getTime() + auction.duration_hours * 60 * 60 * 1000);
    auction.approved_by = adminId;
    await this.auctionRepository.save(auction);
    await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.IN_AUCTION });
    return auction;
  }

  async getAuctions() {
    const auctions = await this.auctionRepository.find({ relations: ["pet"], order: { created_at: "DESC" } });
    const visible = auctions.filter(a => [AuctionStatus.LIVE, AuctionStatus.SCHEDULED].includes(a.status));
    return await Promise.all(visible.map((auction) => this.publicAuction(auction)));
  }

  async getAuction(id: string) {
    const auction = await this.auctionRepository.findOne({ where: { id }, relations: ["pet"] });
    if (!auction) throw new NotFoundException("Auction not found");
    return await this.publicAuction(auction);
  }

  private async publicAuction(auction: Auction) {
    const count = await this.bidRepository.count({ where: { auction_id: auction.id } });
    return {
      id: auction.id, pet: auction.pet, start_price: Number(auction.start_price),
      current_highest_bid: auction.highest_bid ? Number(auction.highest_bid) : null,
      minimum_next_bid: auction.highest_bid ? Number(auction.highest_bid) + 5000 : Number(auction.start_price),
      bidder_count: count, start_time: auction.start_time, end_time: auction.end_time,
      status: auction.status,
    };
  }

  async decidePriceDrop(id: string, sellerId: string, dto: PriceDropDecisionDto) {
    const auction = await this.auctionRepository.findOne({ where: { id } });
    if (!auction) throw new NotFoundException("Auction not found");
    if (auction.seller_id !== sellerId) throw new ForbiddenException("Only the seller can decide this offer");
    if (auction.status !== AuctionStatus.AWAITING_SELLER) throw new ConflictException("No price-drop offer is waiting");
    if (!auction.offer_expires_at || auction.offer_expires_at < new Date()) throw new ConflictException("Price-drop offer has expired");
    if (dto.decision === "withdraw") {
      auction.status = AuctionStatus.WITHDRAWN;
      await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.WITHDRAWN });
    } else {
      if (!auction.offer_price || Number(auction.offer_price) < MIN_START_PRICE) throw new BadRequestException("Price cannot be reduced below BDT 50,000");
      auction.start_price = Number(auction.offer_price);
      auction.round_no += 1;
      auction.status = AuctionStatus.SCHEDULED;
      auction.start_time = new Date();
      auction.end_time = new Date(Date.now() + auction.duration_hours * 60 * 60 * 1000);
      auction.highest_bid = undefined;
      auction.highest_bidder_id = undefined;
      auction.offer_price = undefined;
      auction.offer_expires_at = undefined;
    }
    return await this.auctionRepository.save(auction);
  }

  @OnEvent("order.paid")
  async handleOrderPaid(payload: { petId: string }) {
    const auction = await this.auctionRepository.findOne({ where: { pet_id: payload.petId } });
    if (!auction) return;
    auction.status = AuctionStatus.ENDED;
    await this.auctionRepository.save(auction);
  }

  @OnEvent("order.expired")
  async handleOrderExpired(payload: { petId: string; source?: string }) {
    if (payload.source !== "auction") return;
    const auction = await this.auctionRepository.findOne({ where: { pet_id: payload.petId } });
    if (!auction) return;
    auction.status = AuctionStatus.UNSOLD;
    await this.auctionRepository.save(auction);
    await this.petRepository.update({ id: payload.petId }, { status: PetStatus.AVAILABLE });
  }
}
