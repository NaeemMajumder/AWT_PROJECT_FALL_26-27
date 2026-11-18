import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Species } from "@/modules/species/entities/species.entity";

@Injectable()
export class SpeciesSeeder implements Seeder {
  constructor(@InjectRepository(Species) private readonly speciesRepository: Repository<Species>) {}

  async seed() {
    const count = await this.speciesRepository.count();
    if (count > 0) {
      return;
    }

    const list = [
      { name: "Dog", category: "mammal", min_age_weeks: 8, vaccination_required: true },
      { name: "Cat", category: "mammal", min_age_weeks: 8, vaccination_required: true },
      { name: "Rabbit", category: "mammal", min_age_weeks: 8, vaccination_required: false },
      { name: "Bird", category: "bird", min_age_weeks: 6, vaccination_required: false },
      { name: "Fish", category: "fish", min_age_weeks: 0, vaccination_required: false },
      { name: "Goat", category: "livestock", min_age_weeks: 12, vaccination_required: true },
      { name: "Cow", category: "livestock", min_age_weeks: 12, vaccination_required: true },
    ];

    for (const item of list) {
      await this.speciesRepository.save(this.speciesRepository.create(item));
    }
  }

  async drop() {}
}
