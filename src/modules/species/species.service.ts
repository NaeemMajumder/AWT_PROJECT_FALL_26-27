
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Species } from "./entities/species.entity";
import { CreateSpeciesDto, UpdateSpeciesDto } from "./dto/species.dto";

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Species)
    private readonly speciesRepository: Repository<Species>,
  ) {}

  async getSpecies() {
    try {
      const species = await this.speciesRepository.find({
        where: { is_allowed: true },
      });
      return species;
    } catch (error) {
      throw error;
    }
  }

  async getRule(speciesId: string) {
    try {
      const species = await this.speciesRepository.findOne({
        where: { id: speciesId },
      });

      if (!species) {
        throw new NotFoundException("Species with ID not found");
      }

      return species;
    } catch (error) {
      throw error;
    }
  }

  async createSpecies(dto: CreateSpeciesDto) {
    try {
      const response = await this.speciesRepository.create(dto);
      return await this.speciesRepository.save(response);
    } catch (error) {
      throw error;
    }
  }

  async updateSpecies(id: string, dto: UpdateSpeciesDto) {
    try {
      const species = await this.speciesRepository.findOne({
        where: { id: id },
      });

      if (!species) {
        throw new NotFoundException("Species with ID not found");
      }

      Object.assign(species, dto);
      return await this.speciesRepository.save(species);
    } catch (error) {
      throw error;
    }
  }
}


