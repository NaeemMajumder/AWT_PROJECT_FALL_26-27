import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pet } from "./entities/pet.entity";
import { PetController } from "./pet.controller";
import { PetService } from "./pet.service";
import { SpeciesModule } from "../species/species.module";
@Module({
  imports: [TypeOrmModule.forFeature([Pet]), SpeciesModule],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
