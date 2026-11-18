import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PetRequest } from "./entities/pet-request.entity";
import { Pet } from "../pet/entities/pet.entity";
import { PetRequestController } from "./pet-request.controller";
import { PetRequestService } from "./pet-request.service";

@Module({
  imports: [TypeOrmModule.forFeature([PetRequest, Pet])],
  controllers: [PetRequestController],
  providers: [PetRequestService],
  exports: [PetRequestService],
})
export class PetRequestModule {}
