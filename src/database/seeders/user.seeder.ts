import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import * as argon from "argon2";
import { User } from "@/modules/user/entities/user.entity";
import { SellerProfile } from "@/modules/seller/entities/seller-profile.entity";
import { VetProfile } from "@/modules/vet/entities/vet-profile.entity";
import { Role } from "@/common/enums/role.enum";
import { ProfileStatus, SellerType } from "@/common/enums/profile-status.enum";

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(SellerProfile) private readonly sellerRepository: Repository<SellerProfile>,
    @InjectRepository(VetProfile) private readonly vetRepository: Repository<VetProfile>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.userRepository.count();
    if (count > 0) {
      console.log("Users already seeded, skipping");
      return;
    }

    const password = await argon.hash("123456");
    const now = new Date();

    const people = [
      { name: "Admin", email: "admin@petbazaar.com", phone: "01700000000", role: Role.ADMIN },
      { name: "Rahim Uddin", email: "rahim@gmail.com", phone: "01711111111", role: Role.CUSTOMER },
      { name: "Karim Hossain", email: "karim@gmail.com", phone: "01722222222", role: Role.CUSTOMER },
      { name: "Sabbir Ahmed", email: "sabbir@gmail.com", phone: "01733333333", role: Role.CUSTOMER },
      { name: "Nusrat Jahan", email: "nusrat@gmail.com", phone: "01744444444", role: Role.CUSTOMER },
      { name: "Dr. Hasan Mahmud", email: "hasan.vet@gmail.com", phone: "01755555555", role: Role.VET },
      { name: "Dr. Mitu Akter", email: "mitu.vet@gmail.com", phone: "01766666666", role: Role.VET },
    ];

    const saved: User[] = [];
    for (const person of people) {
      const user = this.userRepository.create({
        name: person.name,
        email: person.email,
        phone: person.phone,
        role: person.role,
        password: password,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      saved.push(await this.userRepository.save(user));
    }

    await this.sellerRepository.save([
      this.sellerRepository.create({
        user_id: saved[3].id,
        shop_name: "Sabbir Pet Corner",
        seller_type: SellerType.INDIVIDUAL,
        status: ProfileStatus.APPROVED,
        reviewed_at: now,
      }),
      this.sellerRepository.create({
        user_id: saved[4].id,
        shop_name: "Paws and Claws BD",
        seller_type: SellerType.SHOP,
        status: ProfileStatus.APPROVED,
        reviewed_at: now,
      }),
    ]);

    await this.vetRepository.save([
      this.vetRepository.create({
        user_id: saved[5].id,
        registration_no: "BVC-10234",
        specialisation: "Small animals",
        district: "Dhaka",
        upazila: "Mirpur",
        chamber_address: "House 12, Road 3, Mirpur 10",
        fee: 500,
        work_start: "09:00",
        work_end: "21:00",
        slot_minutes: 30,
        modes: ["online", "chamber"],
        status: ProfileStatus.APPROVED,
      }),
      this.vetRepository.create({
        user_id: saved[6].id,
        registration_no: "BVC-20871",
        specialisation: "Cattle and birds",
        district: "Rangpur",
        upazila: "Pirgacha",
        chamber_address: "Pirgacha Bazar, Rangpur",
        fee: 300,
        work_start: "10:00",
        work_end: "18:00",
        slot_minutes: 30,
        modes: ["online"],
        status: ProfileStatus.APPROVED,
      }),
    ]);
  }

  async drop() {
    await this.dataSource.query(
      "TRUNCATE TABLE reviews, notifications, payments, order_items, orders, cart_items, carts, products, " +
        "consultations, bid_revisions, bids, auctions, pet_requests, pets, species, vet_profiles, seller_profiles, users CASCADE",
    );
  }
}
