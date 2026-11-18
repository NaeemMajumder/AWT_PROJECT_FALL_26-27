import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VetProfile } from "./entities/vet-profile.entity";
import { VetController } from "./vet.controller";
import { VetService } from "./vet.service";
import { UserModule } from "../user/user.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [TypeOrmModule.forFeature([VetProfile]), UserModule, NotificationModule],
  controllers: [VetController],
  providers: [VetService],
  exports: [VetService],
})
export class VetModule {}
