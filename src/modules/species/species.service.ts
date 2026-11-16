import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Species } from "./entities/species.entity";
import { CreateSpeciesDto, UpdateSpeciesDto } from "./dto/species.dto";

@Injectable()
export class SpeciesService {
  constructor(@InjectRepository(Species) private readonly speciesRepository: Repository<Species>) {}

  async getSpecies() {
    return await this.speciesRepository.find({ order: { name: "ASC" } });
  }

  async getAllowedSpecies() {
    return await this.speciesRepository.find({ where: { is_allowed: true }, order: { name: "ASC" } });
  }

  async getRule(id: string) {
    const species = await this.speciesRepository.findOne({ where: { id } });
    if (!species) throw new NotFoundException("Species not found");
    return species;
  }

  async createSpecies(dto: CreateSpeciesDto) {
    const existing = await this.speciesRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException("This species already exists");
    const species = this.speciesRepository.create(dto);
    return await this.speciesRepository.save(species);
  }

  async updateSpecies(id: string, dto: UpdateSpeciesDto) {
    const species = await this.getRule(id);
    Object.assign(species, dto);
    return await this.speciesRepository.save(species);
  }
}
