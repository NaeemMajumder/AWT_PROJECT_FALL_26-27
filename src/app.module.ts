import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";
import { UserModule } from "./modules/user/user.module";
import { TestModule } from "./modules/test/test.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SpeciesModule } from "./modules/species/species.module";
import { PetModule } from "./modules/pet/pet.module";
import { PetRequestModule } from "./modules/pet-request/pet-request.module";
import { AuctionModule } from "./modules/auction/auction.module";
import { ConsultationModule } from "./modules/consultation/consultation.module";
import { JobsModule } from "./jobs/jobs.module";
import { AuthModule } from "./modules/auth/auth.module";


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
    AuthModule,
    UserModule,
   TestModule,
  SpeciesModule,
PetModule,
PetRequestModule,
AuctionModule,
ConsultationModule,
JobsModule


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
