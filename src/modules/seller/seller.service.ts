import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SellerProfile } from "./entities/seller-profile.entity";
import { CreateSellerApplicationDto, ReviewApplicationDto } from "./dto/seller.dto";
import { ProfileStatus } from "@/common/enums/profile-status.enum";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "@/common/enums/notification-type.enum";

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerRepository: Repository<SellerProfile>,
    private readonly notificationService: NotificationService,
  ) {}

  async apply(userId: string, dto: CreateSellerApplicationDto, documentPath?: string) {
    try {
      const old = await this.sellerRepository.findOne({ where: { user_id: userId } });

      if (old && old.status !== ProfileStatus.REJECTED) {
        throw new ConflictException("You already have a seller application");
      }

      if (old) {
        old.shop_name = dto.shop_name;
        old.seller_type = dto.seller_type;
        old.status = ProfileStatus.PENDING;
        old.reject_reason = null;
        old.reviewed_at = null;
        if (documentPath) {
          old.document_path = documentPath;
        }
        return await this.sellerRepository.save(old);
      }

      const profile = this.sellerRepository.create({
        user_id: userId,
        shop_name: dto.shop_name,
        seller_type: dto.seller_type,
        document_path: documentPath,
        status: ProfileStatus.PENDING,
      });
      return await this.sellerRepository.save(profile);
    } catch (error) {
      throw error;
    }
  }

  async getMyProfile(userId: string) {
    try {
      const profile = await this.sellerRepository.findOne({ where: { user_id: userId } });
      if (!profile) {
        throw new NotFoundException("You have not applied as a seller yet");
      }
      return profile;
    } catch (error) {
      throw error;
    }
  }

  async getPublicProfile(id: string) {
    try {
      const profile = await this.sellerRepository.findOne({
        where: { id: id, status: ProfileStatus.APPROVED },
        relations: ["user"],
      });
      if (!profile) {
        throw new NotFoundException("Seller not found");
      }
      return {
        id: profile.id,
        user_id: profile.user_id,
        shop_name: profile.shop_name,
        seller_type: profile.seller_type,
        name: profile.user.name,
        joined_at: profile.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  async getApplications(status?: ProfileStatus) {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }
      return await this.sellerRepository.find({
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
      const profile = await this.sellerRepository.findOne({ where: { id: id } });
      if (!profile) {
        throw new NotFoundException("Seller application not found");
      }
      if (profile.status !== ProfileStatus.PENDING) {
        throw new BadRequestException("This application is already reviewed");
      }
      if (dto.status === ProfileStatus.REJECTED && !dto.reason) {
        throw new BadRequestException("Please give a reason for rejection");
      }

      profile.status = dto.status;
      profile.reject_reason = dto.status === ProfileStatus.REJECTED ? dto.reason : null;
      profile.reviewed_at = new Date();
      const saved = await this.sellerRepository.save(profile);

      await this.notificationService.notify(
        profile.user_id,
        NotificationType.APPLICATION_REVIEWED,
        "Your seller application is " + dto.status,
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async isApprovedSeller(userId: string) {
    const profile = await this.sellerRepository.findOne({ where: { user_id: userId } });
    if (profile && profile.status === ProfileStatus.APPROVED) {
      return true;
    }
    return false;
  }

  async countPending() {
    return await this.sellerRepository.count({ where: { status: ProfileStatus.PENDING } });
  }
}
