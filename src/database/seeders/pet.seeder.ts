import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import { Pet } from "@/modules/pet/entities/pet.entity";
import { User } from "@/modules/user/entities/user.entity";
import { Species } from "@/modules/species/entities/species.entity";
import { ListingType, PetGender, PetStatus } from "@/common/enums/pet.enum";

@Injectable()
export class PetSeeder implements Seeder {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Species) private readonly speciesRepository: Repository<Species>,
  ) {}

  async seed() {
    const count = await this.petRepository.count();
    if (count > 0) {
      return;
    }

    const sabbir = await this.userRepository.findOne({ where: { email: "sabbir@gmail.com" } });
    const nusrat = await this.userRepository.findOne({ where: { email: "nusrat@gmail.com" } });
    const karim = await this.userRepository.findOne({ where: { email: "karim@gmail.com" } });
    const dog = await this.speciesRepository.findOne({ where: { name: "Dog" } });
    const cat = await this.speciesRepository.findOne({ where: { name: "Cat" } });
    const bird = await this.speciesRepository.findOne({ where: { name: "Bird" } });
    const rabbit = await this.speciesRepository.findOne({ where: { name: "Rabbit" } });
    if (!sabbir || !nusrat || !karim || !dog || !cat || !bird || !rabbit) {
      console.log("Run user and species seeders first");
      return;
    }

    const pets = [
      {
        owner_id: sabbir.id,
        species_id: dog.id,
        title: "German Shepherd puppy",
        breed: "German Shepherd",
        gender: PetGender.MALE,
        birth_date: "2026-06-10",
        vaccinated: true,
        listing_type: ListingType.SALE,
        district: "Dhaka",
        area: "Mirpur 10",
        price: 65000,
        status: PetStatus.IN_AUCTION,
      },
      {
        owner_id: sabbir.id,
        species_id: cat.id,
        title: "Persian kitten, white",
        breed: "Persian",
        gender: PetGender.FEMALE,
        birth_date: "2026-07-01",
        vaccinated: true,
        listing_type: ListingType.SALE,
        district: "Dhaka",
        area: "Uttara",
        price: 18000,
        status: PetStatus.AVAILABLE,
      },
      {
        owner_id: nusrat.id,
        species_id: dog.id,
        title: "Golden Retriever, 4 months",
        breed: "Golden Retriever",
        gender: PetGender.FEMALE,
        birth_date: "2026-07-15",
        vaccinated: true,
        listing_type: ListingType.SALE,
        district: "Chattogram",
        area: "GEC",
        price: 80000,
        status: PetStatus.AVAILABLE,
      },
      {
        owner_id: nusrat.id,
        species_id: bird.id,
        title: "Pair of budgerigars",
        breed: "Budgerigar",
        gender: PetGender.UNKNOWN,
        birth_date: "2026-08-01",
        vaccinated: false,
        listing_type: ListingType.SALE,
        district: "Sylhet",
        area: "Zindabazar",
        price: 1500,
        status: PetStatus.AVAILABLE,
      },
      {
        owner_id: karim.id,
        species_id: cat.id,
        title: "Rescued street kitten",
        breed: "Deshi",
        gender: PetGender.MALE,
        birth_date: "2026-08-20",
        vaccinated: true,
        listing_type: ListingType.ADOPTION,
        is_rescue: true,
        district: "Dhaka",
        area: "Dhanmondi",
        price: 0,
        status: PetStatus.AVAILABLE,
      },
      {
        owner_id: karim.id,
        species_id: rabbit.id,
        title: "Friendly rabbit needs a home",
        breed: "Lionhead",
        gender: PetGender.FEMALE,
        birth_date: "2026-05-05",
        vaccinated: false,
        listing_type: ListingType.ADOPTION,
        district: "Rajshahi",
        area: "Shaheb Bazar",
        price: 0,
        status: PetStatus.PENDING_REVIEW,
      },
    ];

    for (const item of pets) {
      await this.petRepository.save(this.petRepository.create(item));
    }
  }

  async drop() {}
}
