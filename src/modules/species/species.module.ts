
import { TypeOrmModule } from "@nestjs/typeorm";
import { Species } from "./entities/species.entity";
import { SpeciesController } from "./species.controller";
import { SpeciesService } from "./species.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([Species])],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
