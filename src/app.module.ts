import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { TestModule } from "./modules/test/test.module";
import { SellerModule } from "./modules/seller/seller.module";
import { VetModule } from "./modules/vet/vet.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ProductModule } from "./modules/product/product.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrderModule } from "./modules/order/order.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { ReviewModule } from "./modules/review/review.module";
import { AdminModule } from "./modules/admin/admin.module";
import { SpeciesModule } from "./modules/species/species.module";
import { PetModule } from "./modules/pet/pet.module";
import { PetRequestModule } from "./modules/pet-request/pet-request.module";
import { AuctionModule } from "./modules/auction/auction.module";
import { ConsultationModule } from "./modules/consultation/consultation.module";
import { JobsModule } from "./jobs/jobs.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    TestModule,
    SellerModule,
    VetModule,
    NotificationModule,
    ProductModule,
    CartModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    AdminModule,
    SpeciesModule,
    PetModule,
    PetRequestModule,
    AuctionModule,
    ConsultationModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
