import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pet } from "./entities/pet.entity";
import { SpeciesService } from "../species/species.service";
import { CreatePetDto, PetSearchQueryDto, ReviewPetDto, UpdatePetDto } from "./dto/pet.dto";
import { ListingType, PetStatus } from "../../common/enums/pet.enum";
import { OnEvent } from "@nestjs/event-emitter";
import { Inject, Optional } from "@nestjs/common";
import { TeamAStorageService } from "../../common/interfaces/team-a-handshake.interface";

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly speciesService: SpeciesService,
    @Optional() @Inject("TEAM_A_STORAGE_SERVICE") private readonly storageService?: TeamAStorageService,
  ) {}

  async getPets(query: PetSearchQueryDto) {
    const qb = this.petRepository.createQueryBuilder("pet")
      .leftJoinAndSelect("pet.species", "species")
      .where("pet.status = :status", { status: PetStatus.AVAILABLE });
    if (query.species_id) qb.andWhere("pet.species_id = :species_id", { species_id: query.species_id });
    if (query.breed) qb.andWhere("LOWER(pet.breed) LIKE LOWER(:breed)", { breed: `%${query.breed}%` });
    if (query.district) qb.andWhere("LOWER(pet.district) = LOWER(:district)", { district: query.district });
    if (query.listing_type) qb.andWhere("pet.listing_type = :listing_type", { listing_type: query.listing_type });
    if (query.is_rescue !== undefined) qb.andWhere("pet.is_rescue = :is_rescue", { is_rescue: query.is_rescue });
    return await qb.orderBy("pet.created_at", "DESC").getMany();
  }

  async getMyPets(userId: string) {
    return await this.petRepository.find({
      where: { owner_id: userId },
      relations: ["species"],
      order: { created_at: "DESC" },
    });
  }

  async getPet(id: string) {
    const pet = await this.petRepository.findOne({ where: { id }, relations: ["species"] });
    if (!pet) throw new NotFoundException("Pet not found");
    return pet;
  }

  async createPet(userId: string, dto: CreatePetDto, photo?: Express.Multer.File) {
    const species = await this.speciesService.getRule(dto.species_id);
    if (!species.is_allowed) throw new BadRequestException("This species is not allowed");
    const ageWeeks = Math.floor((Date.now() - new Date(dto.birth_date).getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (ageWeeks < species.min_age_weeks) throw new BadRequestException("Pet does not meet the minimum age rule");
    if (species.vaccination_required && !dto.vaccinated) throw new BadRequestException("Vaccination is required for this species");
    if (dto.listing_type === ListingType.ADOPTION && Number(dto.price) !== 0) throw new BadRequestException("Adoption pets must have price 0");
    if (dto.listing_type === ListingType.SALE && Number(dto.price) <= 0) throw new BadRequestException("Sale pets must have a price greater than 0");

    let photoPath: string | undefined;
    if (photo) {
      if (!this.storageService) throw new BadRequestException("Photo upload is waiting for Team A StorageService.save() handshake");
      photoPath = await this.storageService.save(photo);
    }
    const pet = this.petRepository.create({
      ...dto, owner_id: userId, photo_path: photoPath,
      is_rescue: dto.is_rescue || false, status: PetStatus.PENDING_REVIEW,
    });
    return await this.petRepository.save(pet);
  }

  async updatePet(id: string, userId: string, dto: UpdatePetDto) {
    const pet = await this.getPet(id);
    if (pet.owner_id !== userId) throw new ForbiddenException("You can update only your own pet");
    if (![PetStatus.PENDING_REVIEW, PetStatus.AVAILABLE].includes(pet.status)) throw new BadRequestException("This pet cannot be edited now");
    if (pet.listing_type === ListingType.ADOPTION && dto.price !== undefined && Number(dto.price) !== 0) throw new BadRequestException("Adoption pets must have price 0");
    Object.assign(pet, dto);
    return await this.petRepository.save(pet);
  }

  async withdrawPet(id: string, userId: string) {
    const pet = await this.getPet(id);
    if (pet.owner_id !== userId) throw new ForbiddenException("You can withdraw only your own pet");
    if ([PetStatus.SOLD, PetStatus.ADOPTED, PetStatus.IN_AUCTION].includes(pet.status)) throw new BadRequestException("This pet cannot be withdrawn now");
    pet.status = PetStatus.WITHDRAWN;
    return await this.petRepository.save(pet);
  }

  async reviewPet(id: string, dto: ReviewPetDto) {
    const pet = await this.getPet(id);
    if (![PetStatus.AVAILABLE, PetStatus.REJECTED].includes(dto.status)) throw new BadRequestException("Review status must be available or rejected");
    if (pet.status !== PetStatus.PENDING_REVIEW) throw new BadRequestException("Only pending listings can be reviewed");
    pet.status = dto.status;
    return await this.petRepository.save(pet);
  }
  @OnEvent("order.paid")
  async handleOrderPaid(payload: { petId: string }) {
    const pet = await this.petRepository.findOne({ where: { id: payload.petId } });
    if (!pet) return;
    pet.status = PetStatus.SOLD;
    await this.petRepository.save(pet);
  }

  @OnEvent("order.expired")
  async handleOrderExpired(payload: { petId: string; source?: string }) {
    const pet = await this.petRepository.findOne({ where: { id: payload.petId } });
    if (!pet) return;
    pet.status = payload.source === "auction" ? PetStatus.IN_AUCTION : PetStatus.AVAILABLE;
    await this.petRepository.save(pet);
  }
}
