import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VetProfile } from "./entities/vet-profile.entity";
import { CreateVetApplicationDto, UpdateVetProfileDto, VetSearchQueryDto } from "./dto/vet.dto";
import { ReviewApplicationDto } from "../seller/dto/seller.dto";
import { ProfileStatus } from "@/common/enums/profile-status.enum";
import { Role } from "@/common/enums/role.enum";
import { UserService } from "../user/user.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "@/common/enums/notification-type.enum";

@Injectable()
export class VetService {
  constructor(
    @InjectRepository(VetProfile)
    private readonly vetRepository: Repository<VetProfile>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async apply(userId: string, dto: CreateVetApplicationDto) {
    try {
      const old = await this.vetRepository.findOne({ where: { user_id: userId } });
      if (old && old.status !== ProfileStatus.REJECTED) {
        throw new ConflictException("You already have a vet application");
      }

      const sameReg = await this.vetRepository.findOne({ where: { registration_no: dto.registration_no } });
      if (sameReg && sameReg.user_id !== userId) {
        throw new ConflictException("This registration number is already used");
      }

      if (old) {
        Object.assign(old, dto);
        old.status = ProfileStatus.PENDING;
        old.reject_reason = null;
        return await this.vetRepository.save(old);
      }

      const profile = this.vetRepository.create({
        user_id: userId,
        registration_no: dto.registration_no,
        specialisation: dto.specialisation,
        district: dto.district,
        upazila: dto.upazila,
        chamber_address: dto.chamber_address,
        fee: dto.fee,
        modes: dto.modes,
        status: ProfileStatus.PENDING,
      });
      return await this.vetRepository.save(profile);
    } catch (error) {
      throw error;
    }
  }

  async getMyProfile(userId: string) {
    try {
      const profile = await this.vetRepository.findOne({ where: { user_id: userId } });
      if (!profile) {
        throw new NotFoundException("You have not applied as a vet yet");
      }
      return profile;
    } catch (error) {
      throw error;
    }
  }

  async updateMyProfile(userId: string, dto: UpdateVetProfileDto) {
    try {
      const profile = await this.getMyProfile(userId);

      const start = dto.work_start || profile.work_start.slice(0, 5);
      const end = dto.work_end || profile.work_end.slice(0, 5);
      if (start >= end) {
        throw new BadRequestException("work_start must be before work_end");
      }

      if (dto.fee !== undefined) profile.fee = dto.fee;
      if (dto.work_start) profile.work_start = dto.work_start;
      if (dto.work_end) profile.work_end = dto.work_end;
      if (dto.slot_minutes) profile.slot_minutes = dto.slot_minutes;
      if (dto.modes) profile.modes = dto.modes;
      if (dto.chamber_address) profile.chamber_address = dto.chamber_address;
      if (dto.specialisation) profile.specialisation = dto.specialisation;

      return await this.vetRepository.save(profile);
    } catch (error) {
      throw error;
    }
  }

  async searchVets(query: VetSearchQueryDto) {
    try {
      const qb = this.vetRepository
        .createQueryBuilder("vet")
        .leftJoin("vet.user", "user")
        .addSelect(["user.name", "user.phone"])
        .where("vet.status = :status", { status: ProfileStatus.APPROVED });

      if (query.district) {
        qb.andWhere("LOWER(vet.district) = LOWER(:district)", { district: query.district });
      }
      if (query.upazila) {
        qb.andWhere("LOWER(vet.upazila) = LOWER(:upazila)", { upazila: query.upazila });
      }
      if (query.mode) {
        qb.andWhere("vet.modes LIKE :mode", { mode: "%" + query.mode + "%" });
      }

      return await qb.orderBy("vet.district", "ASC").getMany();
    } catch (error) {
      throw error;
    }
  }

  async getPublicVet(id: string) {
    try {
      const vet = await this.vetRepository.findOne({
        where: { id: id, status: ProfileStatus.APPROVED },
        relations: ["user"],
      });
      if (!vet) {
        throw new NotFoundException("Vet not found");
      }
      return vet;
    } catch (error) {
      throw error;
    }
  }

  async getApprovedVet(id: string) {
    const vet = await this.vetRepository.findOne({ where: { id: id } });
    if (!vet || vet.status !== ProfileStatus.APPROVED) {
      throw new NotFoundException("Vet not found");
    }
    return vet;
  }

  async getVetProfileByUserId(userId: string) {
    const vet = await this.vetRepository.findOne({ where: { user_id: userId } });
    if (!vet) {
      throw new NotFoundException("Vet profile not found");
    }
    return vet;
  }

  async getApplications(status?: ProfileStatus) {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }
      return await this.vetRepository.find({
        where: where,
        relations: ["user"],
        order: { created_at: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async review(id: string, dto: ReviewApplicationDto) {
    try {
      const profile = await this.vetRepository.findOne({ where: { id: id } });
      if (!profile) {
        throw new NotFoundException("Vet application not found");
      }
      if (profile.status !== ProfileStatus.PENDING) {
        throw new BadRequestException("This application is already reviewed");
      }
      if (dto.status === ProfileStatus.REJECTED && !dto.reason) {
        throw new BadRequestException("Please give a reason for rejection");
      }

      profile.status = dto.status;
      profile.reject_reason = dto.status === ProfileStatus.REJECTED ? dto.reason : null;
      const saved = await this.vetRepository.save(profile);

      if (dto.status === ProfileStatus.APPROVED) {
        await this.userService.setRole(profile.user_id, Role.VET);
      }
      await this.notificationService.notify(
        profile.user_id,
        NotificationType.APPLICATION_REVIEWED,
        "Your vet application is " + dto.status + ". Please login again.",
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async countPending() {
    return await this.vetRepository.count({ where: { status: ProfileStatus.PENDING } });
  }
}
