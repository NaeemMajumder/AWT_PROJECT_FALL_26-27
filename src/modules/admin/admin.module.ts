import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { UserModule } from "../user/user.module";
import { SellerModule } from "../seller/seller.module";
import { VetModule } from "../vet/vet.module";
import { OrderModule } from "../order/order.module";

@Module({
  imports: [UserModule, SellerModule, VetModule, OrderModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
