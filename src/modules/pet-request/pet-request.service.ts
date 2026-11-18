import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Not, Repository } from "typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { PetRequest } from "./entities/pet-request.entity";
import { Pet } from "../pet/entities/pet.entity";
import { User } from "../user/entities/user.entity";
import { CreatePetRequestDto } from "./dto/pet-request.dto";
import { OrderService } from "../order/order.service";
import { NotificationService } from "../notification/notification.service";
import { ListingType, PetStatus } from "@/common/enums/pet.enum";
import { RequestStatus, RequestType } from "@/common/enums/pet-request.enum";
import { OrderSource } from "@/common/enums/order.enum";
import { NotificationType } from "@/common/enums/notification-type.enum";
import { ORDER_EXPIRED } from "@/common/constants/events.constants";
import { OrderEventPayload } from "@/common/interfaces/order-event.interface";

@Injectable()
export class PetRequestService {
  constructor(
    @InjectRepository(PetRequest) private readonly requestRepository: Repository<PetRequest>,
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
  ) {}

  async createRequest(userId: string, dto: CreatePetRequestDto) {
    try {
      const pet = await this.petRepository.findOne({ where: { id: dto.pet_id } });
      if (!pet) {
        throw new NotFoundException("Pet not found");
      }
      if (pet.owner_id === userId) {
        throw new BadRequestException("You can not request your own pet");
      }
      if (pet.status !== PetStatus.AVAILABLE) {
        throw new ConflictException("This pet is not available");
      }
      if (dto.type === RequestType.PURCHASE && pet.listing_type !== ListingType.SALE) {
        throw new BadRequestException("This pet is not listed for sale");
      }
      if (dto.type === RequestType.ADOPTION && pet.listing_type !== ListingType.ADOPTION) {
        throw new BadRequestException("This pet is not listed for adoption");
      }

      const existing = await this.requestRepository.findOne({
        where: { pet_id: dto.pet_id, requester_id: userId, status: RequestStatus.PENDING },
      });
      if (existing) {
        throw new ConflictException("You already have a pending request for this pet");
      }

      const request = this.requestRepository.create({
        pet_id: dto.pet_id,
        requester_id: userId,
        type: dto.type,
        message: dto.message,
        status: RequestStatus.PENDING,
      });
      return await this.requestRepository.save(request);
    } catch (error) {
      throw error;
    }
  }

  async getMyRequests(userId: string) {
    try {
      return await this.requestRepository.find({
        where: { requester_id: userId },
        relations: ["pet"],
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getPetRequests(petId: string, ownerId: string) {
    try {
      const pet = await this.petRepository.findOne({ where: { id: petId } });
      if (!pet) {
        throw new NotFoundException("Pet not found");
      }
      if (pet.owner_id !== ownerId) {
        throw new ForbiddenException("You can see requests only for your own pet");
      }

      const requests = await this.requestRepository.find({
        where: { pet_id: petId },
        relations: ["requester"],
        order: { created_at: "DESC" },
      });

      return requests.map((request) => ({
        id: request.id,
        type: request.type,
        message: request.message,
        status: request.status,
        created_at: request.created_at,
        decided_at: request.decided_at,
        requester: {
          id: request.requester.id,
          name: request.requester.name,
          phone: request.status === RequestStatus.ACCEPTED ? request.requester.phone : null,
        },
      }));
    } catch (error) {
      throw error;
    }
  }

  async acceptRequest(requestId: string, ownerId: string) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const request = await manager.findOne(PetRequest, {
          where: { id: requestId },
          lock: { mode: "pessimistic_write" },
        });
        if (!request) {
          throw new NotFoundException("Request not found");
        }

        const pet = await manager.findOne(Pet, {
          where: { id: request.pet_id },
          lock: { mode: "pessimistic_write" },
        });
        if (!pet) {
          throw new NotFoundException("Pet not found");
        }
        if (pet.owner_id !== ownerId) {
          throw new ForbiddenException("Only the pet owner can accept a request");
        }
        if (request.status !== RequestStatus.PENDING || pet.status !== PetStatus.AVAILABLE) {
          throw new ConflictException("This pet is already taken or the request is closed");
        }

        request.status = RequestStatus.ACCEPTED;
        request.decided_at = new Date();
        await manager.save(request);

        if (request.type === RequestType.ADOPTION) {
          pet.status = PetStatus.ADOPTED;
        } else {
          pet.status = PetStatus.RESERVED;
        }
        await manager.save(pet);

        await manager.update(
          PetRequest,
          { pet_id: pet.id, id: Not(request.id), status: RequestStatus.PENDING },
          { status: RequestStatus.REJECTED, decided_at: new Date() },
        );

        let orderId = null;
        if (request.type === RequestType.PURCHASE) {
          const order = await this.orderService.createPetOrder(
            {
              buyerId: request.requester_id,
              sellerId: pet.owner_id,
              petId: pet.id,
              amount: Number(pet.price),
              source: OrderSource.REQUEST,
              sourceId: request.id,
            },
            manager,
          );
          orderId = order.id;
        }

        return { request: request, orderId: orderId };
      });

      const owner = await this.dataSource.getRepository(User).findOne({ where: { id: ownerId } });
      let message = "Your adoption request was accepted.";
      if (result.request.type === RequestType.PURCHASE) {
        message = "Your purchase request was accepted. Please pay within the time limit.";
      }
      if (owner && owner.phone) {
        message = message + " Owner phone: " + owner.phone;
      }
      await this.notificationService.notify(result.request.requester_id, NotificationType.REQUEST_ACCEPTED, message);

      return {
        message: "Request accepted",
        request: result.request,
        order_id: result.orderId,
      };
    } catch (error) {
      throw error;
    }
  }

  async rejectRequest(requestId: string, ownerId: string) {
    try {
      const request = await this.requestRepository.findOne({
        where: { id: requestId },
        relations: ["pet"],
      });
      if (!request) {
        throw new NotFoundException("Request not found");
      }
      if (request.pet.owner_id !== ownerId) {
        throw new ForbiddenException("Only the pet owner can reject this request");
      }
      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException("Only pending requests can be rejected");
      }
      request.status = RequestStatus.REJECTED;
      request.decided_at = new Date();
      const saved = await this.requestRepository.save(request);

      await this.notificationService.notify(
        request.requester_id,
        NotificationType.REQUEST_REJECTED,
        "Your request for " + request.pet.title + " was rejected",
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async cancelRequest(requestId: string, userId: string) {
    try {
      const request = await this.requestRepository.findOne({ where: { id: requestId } });
      if (!request) {
        throw new NotFoundException("Request not found");
      }
      if (request.requester_id !== userId) {
        throw new ForbiddenException("You can cancel only your own request");
      }
      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException("Only pending requests can be cancelled");
      }
      request.status = RequestStatus.CANCELLED;
      request.decided_at = new Date();
      return await this.requestRepository.save(request);
    } catch (error) {
      throw error;
    }
  }

  @OnEvent(ORDER_EXPIRED)
  async handleOrderExpired(payload: OrderEventPayload) {
    if (payload.source !== OrderSource.REQUEST) {
      return;
    }
    await this.requestRepository.update(
      { id: payload.sourceId, status: RequestStatus.ACCEPTED },
      { status: RequestStatus.EXPIRED },
    );
  }
}
