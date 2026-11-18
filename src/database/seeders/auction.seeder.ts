import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Auction } from "@/modules/auction/entities/auction.entity";
import { Pet } from "@/modules/pet/entities/pet.entity";
import { User } from "@/modules/user/entities/user.entity";
import { AuctionStatus } from "@/common/enums/auction.enum";

@Injectable()
export class AuctionSeeder implements Seeder {
  constructor(
    @InjectRepository(Auction) private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const count = await this.auctionRepository.count();
    if (count > 0) {
      return;
    }

    const admin = await this.userRepository.findOne({ where: { email: "admin@petbazaar.com" } });
    const pet = await this.petRepository.findOne({ where: { title: "German Shepherd puppy" } });
    if (!admin || !pet) {
      return;
    }

    const start = new Date(Date.now() - 60 * 60 * 1000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const auction = this.auctionRepository.create({
      pet_id: pet.id,
      seller_id: pet.owner_id,
      start_price: 60000,
      duration_hours: 24,
      start_time: start,
      end_time: end,
      round_no: 1,
      extension_count: 0,
      status: AuctionStatus.LIVE,
      approved_by: admin.id,
    });
    await this.auctionRepository.save(auction);
  }

  async drop() {}
}
