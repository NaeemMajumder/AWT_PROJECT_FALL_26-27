import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Inject, Optional } from "@nestjs/common";
import { TeamAOrdersService, TeamANotificationsService } from "../../common/interfaces/team-a-handshake.interface";
import { PetRequest } from "./entities/pet-request.entity";
import { Pet } from "../pet/entities/pet.entity";
import { CreatePetRequestDto } from "./dto/pet-request.dto";
import { ListingType, PetStatus } from "../../common/enums/pet.enum";
import { RequestStatus, RequestType } from "../../common/enums/pet-request.enum";

@Injectable()
export class PetRequestService {
  constructor(
    @InjectRepository(PetRequest) private readonly requestRepository: Repository<PetRequest>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly dataSource: DataSource,
    @Optional() @Inject("TEAM_A_ORDERS_SERVICE") private readonly ordersService?: TeamAOrdersService,
    @Optional() @Inject("TEAM_A_NOTIFICATIONS_SERVICE") private readonly notificationsService?: TeamANotificationsService,
  ) {}

  async createRequest(userId: string, dto: CreatePetRequestDto) {
    const pet = await this.petRepository.findOne({ where: { id: dto.pet_id } });
    if (!pet) throw new NotFoundException("Pet not found");
    if (pet.owner_id === userId) throw new BadRequestException("You cannot request your own pet");
    if (pet.status !== PetStatus.AVAILABLE) throw new ConflictException("This pet is not available");
    if (dto.type === RequestType.PURCHASE && pet.listing_type !== ListingType.SALE) throw new BadRequestException("This pet is not listed for sale");
    if (dto.type === RequestType.ADOPTION && pet.listing_type !== ListingType.ADOPTION) throw new BadRequestException("This pet is not listed for adoption");
    const existing = await this.requestRepository.findOne({ where: { pet_id: dto.pet_id, requester_id: userId, status: RequestStatus.PENDING } });
    if (existing) throw new ConflictException("You already have a pending request for this pet");
    return await this.requestRepository.save(this.requestRepository.create({
      ...dto, requester_id: userId, status: RequestStatus.PENDING,
    }));
  }

  async getMyRequests(userId: string) {
    return await this.requestRepository.find({ where: { requester_id: userId }, relations: ["pet"], order: { created_at: "DESC" } });
  }

  async getPetRequests(petId: string, ownerId: string) {
    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) throw new NotFoundException("Pet not found");
    if (pet.owner_id !== ownerId) throw new ForbiddenException("You can view requests only for your own pet");
    return await this.requestRepository.find({ where: { pet_id: petId }, relations: ["requester"], order: { created_at: "DESC" } });
  }

  async acceptRequest(requestId: string, ownerId: string) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const request = await runner.manager.findOne(PetRequest, { where: { id: requestId }, lock: { mode: "pessimistic_write" } });
      if (!request) throw new NotFoundException("Request not found");
      const pet = await runner.manager.findOne(Pet, { where: { id: request.pet_id }, lock: { mode: "pessimistic_write" } });
      if (!pet) throw new NotFoundException("Pet not found");
      if (pet.owner_id !== ownerId) throw new ForbiddenException("Only the pet owner can accept a request");
      if (request.status !== RequestStatus.PENDING || pet.status !== PetStatus.AVAILABLE) throw new ConflictException("This pet or request is no longer available");
      request.status = RequestStatus.ACCEPTED;
      request.decided_at = new Date();
      await runner.manager.save(request);
      pet.status = request.type === RequestType.ADOPTION ? PetStatus.ADOPTED : PetStatus.RESERVED;
      await runner.manager.save(pet);
      await runner.manager.createQueryBuilder().update(PetRequest)
        .set({ status: RequestStatus.REJECTED, decided_at: new Date() })
        .where("pet_id = :petId AND id != :requestId AND status = :pending", {
          petId: pet.id, requestId: request.id, pending: RequestStatus.PENDING,
        }).execute();
      if (request.type === RequestType.PURCHASE) {
        if (!this.ordersService) throw new BadRequestException("Purchase acceptance is waiting for Team A OrdersService.createPetOrder() handshake");
        await this.ordersService.createPetOrder({
          buyerId: request.requester_id,
          sellerId: pet.owner_id,
          petId: pet.id,
          price: Number(pet.price),
          source: "request",
          payBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }
      await runner.commitTransaction();
      if (this.notificationsService) {
        await this.notificationsService.notify(request.requester_id, "request_accepted", "Your pet request has been accepted");
      }
      return { message: request.type === RequestType.ADOPTION ? "Adoption request accepted" : "Purchase request accepted; pet reserved pending payment", request };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async rejectRequest(requestId: string, ownerId: string) {
    const request = await this.requestRepository.findOne({ where: { id: requestId }, relations: ["pet"] });
    if (!request) throw new NotFoundException("Request not found");
    if (request.pet.owner_id !== ownerId) throw new ForbiddenException("Only the pet owner can reject this request");
    if (request.status !== RequestStatus.PENDING) throw new ConflictException("Only pending requests can be rejected");
    request.status = RequestStatus.REJECTED;
    request.decided_at = new Date();
    return await this.requestRepository.save(request);
  }

  async cancelRequest(requestId: string, userId: string) {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Request not found");
    if (request.requester_id !== userId) throw new ForbiddenException("You can cancel only your own request");
    if (request.status !== RequestStatus.PENDING) throw new ConflictException("Only pending requests can be cancelled");
    request.status = RequestStatus.CANCELLED;
    request.decided_at = new Date();
    return await this.requestRepository.save(request);
  }
}
