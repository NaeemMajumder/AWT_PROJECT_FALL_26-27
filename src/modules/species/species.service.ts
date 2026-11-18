import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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

  async getAllowedSpecies() {
    try {
      return await this.speciesRepository.find({
        where: { is_allowed: true },
        order: { name: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllSpecies() {
    try {
      return await this.speciesRepository.find({ order: { name: "ASC" } });
    } catch (error) {
      throw error;
    }
  }

  async getRule(id: string) {
    const species = await this.speciesRepository.findOne({ where: { id: id } });
    if (!species) {
      throw new NotFoundException("Species not found");
    }
    return species;
  }

  async createSpecies(dto: CreateSpeciesDto) {
    try {
      const existing = await this.speciesRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException("This species already exists");
      }
      const species = this.speciesRepository.create(dto);
      return await this.speciesRepository.save(species);
    } catch (error) {
      throw error;
    }
  }

  async updateSpecies(id: string, dto: UpdateSpeciesDto) {
    try {
      const species = await this.getRule(id);
      if (dto.category) species.category = dto.category;
      if (dto.min_age_weeks !== undefined) species.min_age_weeks = dto.min_age_weeks;
      if (dto.vaccination_required !== undefined) species.vaccination_required = dto.vaccination_required;
      if (dto.is_allowed !== undefined) species.is_allowed = dto.is_allowed;
      return await this.speciesRepository.save(species);
    } catch (error) {
      throw error;
    }
  }
}
