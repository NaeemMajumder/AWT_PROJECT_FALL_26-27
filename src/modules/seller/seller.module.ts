import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SellerProfile } from "./entities/seller-profile.entity";
import { SellerController } from "./seller.controller";
import { SellerService } from "./seller.service";
import { StorageModule } from "@/providers/storage/local/storage.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile]), StorageModule, NotificationModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
