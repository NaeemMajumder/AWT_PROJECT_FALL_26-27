import { seeder } from "nestjs-seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import dataSourceOptions from "./config/database.config";
import { User } from "./modules/user/entities/user.entity";
import { SellerProfile } from "./modules/seller/entities/seller-profile.entity";
import { VetProfile } from "./modules/vet/entities/vet-profile.entity";
import { Species } from "./modules/species/entities/species.entity";
import { Pet } from "./modules/pet/entities/pet.entity";
import { Auction } from "./modules/auction/entities/auction.entity";
import { Consultation } from "./modules/consultation/entities/consultation.entity";
import { Product } from "./modules/product/entities/product.entity";
import { Order } from "./modules/order/entities/order.entity";
import { OrderItem } from "./modules/order/entities/order-item.entity";
import { Payment } from "./modules/payment/entities/payment.entity";
import { UserSeeder } from "./database/seeders/user.seeder";
import { SpeciesSeeder } from "./database/seeders/species.seeder";
import { PetSeeder } from "./database/seeders/pet.seeder";
import { AuctionSeeder } from "./database/seeders/auction.seeder";
import { ConsultationSeeder } from "./database/seeders/consultation.seeder";
import { ProductSeeder } from "./database/seeders/product.seeder";
import { OrderSeeder } from "./database/seeders/order.seeder";

seeder({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([
      User,
      SellerProfile,
      VetProfile,
      Species,
      Pet,
      Auction,
      Consultation,
      Product,
      Order,
      OrderItem,
      Payment,
    ]),
  ],
}).run([UserSeeder, SpeciesSeeder, PetSeeder, AuctionSeeder, ConsultationSeeder, ProductSeeder, OrderSeeder]);
