import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PetRequest } from "./entities/pet-request.entity";
import { Pet } from "../pet/entities/pet.entity";
import { PetRequestController } from "./pet-request.controller";
import { PetRequestService } from "./pet-request.service";
import { OrderModule } from "../order/order.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [TypeOrmModule.forFeature([PetRequest, Pet]), OrderModule, NotificationModule],
  controllers: [PetRequestController],
  providers: [PetRequestService],
})
export class PetRequestModule {}
