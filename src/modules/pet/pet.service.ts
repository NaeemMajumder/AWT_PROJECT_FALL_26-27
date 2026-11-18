import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { Pet } from "./entities/pet.entity";
import { CreatePetDto, PetSearchQueryDto, ReviewPetDto, UpdatePetDto } from "./dto/pet.dto";
import { SpeciesService } from "../species/species.service";
import { SellerService } from "../seller/seller.service";
import { ListingType, PetStatus } from "@/common/enums/pet.enum";
import { OrderEventPayload } from "@/common/interfaces/order-event.interface";
import { ORDER_EXPIRED, ORDER_PAID } from "@/common/constants/events.constants";

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly speciesService: SpeciesService,
    private readonly sellerService: SellerService,
  ) {}

  async getPets(query: PetSearchQueryDto) {
    try {
      const qb = this.petRepository
        .createQueryBuilder("pet")
        .leftJoinAndSelect("pet.species", "species")
        .where("pet.status = :status", { status: PetStatus.AVAILABLE });

      if (query.species_id) {
        qb.andWhere("pet.species_id = :speciesId", { speciesId: query.species_id });
      }
      if (query.breed) {
        qb.andWhere("pet.breed ILIKE :breed", { breed: "%" + query.breed + "%" });
      }
      if (query.district) {
        qb.andWhere("LOWER(pet.district) = LOWER(:district)", { district: query.district });
      }
      if (query.listing_type) {
        qb.andWhere("pet.listing_type = :listingType", { listingType: query.listing_type });
      }
      if (query.is_rescue !== undefined) {
        qb.andWhere("pet.is_rescue = :isRescue", { isRescue: query.is_rescue });
      }

      return await qb.orderBy("pet.created_at", "DESC").getMany();
    } catch (error) {
      throw error;
    }
  }

  async getMyPets(userId: string) {
    try {
      return await this.petRepository.find({
        where: { owner_id: userId },
        relations: ["species"],
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getPet(id: string) {
    const pet = await this.petRepository.findOne({
      where: { id: id },
      relations: ["species"],
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    return pet;
  }

  async getPendingPets() {
    try {
      return await this.petRepository.find({
        where: { status: PetStatus.PENDING_REVIEW },
        relations: ["species"],
        order: { created_at: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async createPet(userId: string, dto: CreatePetDto, photoPath?: string) {
    try {
      if (dto.listing_type === ListingType.SALE) {
        const approved = await this.sellerService.isApprovedSeller(userId);
        if (!approved) {
          throw new ForbiddenException("Only approved sellers can list a pet for sale");
        }
        if (dto.price <= 0) {
          throw new BadRequestException("Sale pets must have a price greater than 0");
        }
      }
      if (dto.listing_type === ListingType.ADOPTION && dto.price !== 0) {
        throw new BadRequestException("Adoption pets must have price 0");
      }

      const species = await this.speciesService.getRule(dto.species_id);
      if (!species.is_allowed) {
        throw new BadRequestException("This species is not allowed on Pet Bazaar");
      }

      const birthDate = new Date(dto.birth_date);
      if (birthDate > new Date()) {
        throw new BadRequestException("Birth date can not be in the future");
      }
      const ageInWeeks = Math.floor((Date.now() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (ageInWeeks < species.min_age_weeks) {
        throw new BadRequestException(
          species.name + " must be at least " + species.min_age_weeks + " weeks old to be listed",
        );
      }
      if (species.vaccination_required && !dto.vaccinated) {
        throw new BadRequestException("Vaccination record is required for " + species.name);
      }

      const pet = this.petRepository.create({
        owner_id: userId,
        species_id: dto.species_id,
        title: dto.title,
        breed: dto.breed,
        gender: dto.gender,
        birth_date: dto.birth_date,
        vaccinated: dto.vaccinated,
        listing_type: dto.listing_type,
        is_rescue: dto.is_rescue || false,
        district: dto.district,
        area: dto.area,
        price: dto.price,
        photo_path: photoPath,
        status: PetStatus.PENDING_REVIEW,
      });
      return await this.petRepository.save(pet);
    } catch (error) {
      throw error;
    }
  }

  async updatePet(id: string, userId: string, dto: UpdatePetDto) {
    try {
      const pet = await this.getPet(id);
      if (pet.owner_id !== userId) {
        throw new ForbiddenException("You can update only your own pet");
      }
      if (pet.status !== PetStatus.PENDING_REVIEW && pet.status !== PetStatus.AVAILABLE) {
        throw new BadRequestException("This pet can not be edited now");
      }

      if (dto.price !== undefined) {
        if (pet.listing_type === ListingType.ADOPTION && dto.price !== 0) {
          throw new BadRequestException("Adoption pets must have price 0");
        }
        if (pet.listing_type === ListingType.SALE && dto.price <= 0) {
          throw new BadRequestException("Sale pets must have a price greater than 0");
        }
        pet.price = dto.price;
      }

      if (dto.title) pet.title = dto.title;
      if (dto.breed) pet.breed = dto.breed;
      if (dto.district) pet.district = dto.district;
      if (dto.area) pet.area = dto.area;
      if (dto.vaccinated !== undefined) pet.vaccinated = dto.vaccinated;

      return await this.petRepository.save(pet);
    } catch (error) {
      throw error;
    }
  }

  async withdrawPet(id: string, userId: string) {
    try {
      const pet = await this.getPet(id);
      if (pet.owner_id !== userId) {
        throw new ForbiddenException("You can withdraw only your own pet");
      }
      if (pet.status !== PetStatus.PENDING_REVIEW && pet.status !== PetStatus.AVAILABLE) {
        throw new BadRequestException("This pet can not be withdrawn now");
      }
      pet.status = PetStatus.WITHDRAWN;
      return await this.petRepository.save(pet);
    } catch (error) {
      throw error;
    }
  }

  async reviewPet(id: string, dto: ReviewPetDto) {
    try {
      const pet = await this.getPet(id);
      if (pet.status !== PetStatus.PENDING_REVIEW) {
        throw new BadRequestException("Only pending listings can be reviewed");
      }
      pet.status = dto.status;
      return await this.petRepository.save(pet);
    } catch (error) {
      throw error;
    }
  }

  async setStatus(id: string, status: PetStatus) {
    await this.petRepository.update({ id: id }, { status: status });
  }

  @OnEvent(ORDER_PAID)
  async handleOrderPaid(payload: OrderEventPayload) {
    await this.petRepository.update({ id: payload.petId }, { status: PetStatus.SOLD });
  }

  @OnEvent(ORDER_EXPIRED)
  async handleOrderExpired(payload: OrderEventPayload) {
    await this.petRepository.update({ id: payload.petId }, { status: PetStatus.AVAILABLE });
  }
}
