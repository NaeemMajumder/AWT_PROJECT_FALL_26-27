import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Auction } from "../modules/auction/entities/auction.entity";
import { Pet } from "../modules/pet/entities/pet.entity";
import { AuctionStatus } from "../common/enums/auction.enum";
import { PetStatus } from "../common/enums/pet.enum";

@Injectable()
export class AuctionPriceDropJob {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
  ) {}

  @Cron("* * * * *")
  async expireOffers() {
    const now = new Date();
    const expired = await this.auctionRepository.createQueryBuilder("auction")
      .where("auction.status = :status", { status: AuctionStatus.AWAITING_SELLER })
      .andWhere("auction.offer_expires_at < :now", { now }).getMany();
    for (const auction of expired) {
      auction.status = AuctionStatus.UNSOLD;
      await this.auctionRepository.save(auction);
      await this.petRepository.update({ id: auction.pet_id }, { status: PetStatus.AVAILABLE });
    }
  }
}
