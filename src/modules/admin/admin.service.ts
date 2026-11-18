import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { UserService } from "../user/user.service";
import { SellerService } from "../seller/seller.service";
import { VetService } from "../vet/vet.service";
import { OrderService } from "../order/order.service";
import { Pet } from "../pet/entities/pet.entity";
import { Auction } from "../auction/entities/auction.entity";
import { Consultation } from "../consultation/entities/consultation.entity";
import { PetStatus } from "@/common/enums/pet.enum";
import { AuctionStatus } from "@/common/enums/auction.enum";
import { OrderStatus } from "@/common/enums/order.enum";

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly sellerService: SellerService,
    private readonly vetService: VetService,
    private readonly orderService: OrderService,
    private readonly dataSource: DataSource,
  ) {}

  async deactivateUser(id: string, adminId: string) {
    try {
      if (id === adminId) {
        throw new BadRequestException("You can not deactivate yourself");
      }
      return await this.userService.setActive(id, false);
    } catch (error) {
      throw error;
    }
  }

  async activateUser(id: string) {
    try {
      return await this.userService.setActive(id, true);
    } catch (error) {
      throw error;
    }
  }

  async getSummary() {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const totalUsers = await this.userService.countUsers();
      const pendingSellers = await this.sellerService.countPending();
      const pendingVets = await this.vetService.countPending();
      const pendingPets = await this.dataSource.getRepository(Pet).count({
        where: { status: PetStatus.PENDING_REVIEW },
      });
      const auctionRequests = await this.dataSource.getRepository(Auction).count({
        where: { status: AuctionStatus.REQUESTED },
      });
      const liveAuctions = await this.dataSource.getRepository(Auction).count({
        where: { status: AuctionStatus.LIVE },
      });
      const todayConsultations = await this.dataSource.getRepository(Consultation).count({
        where: { date: today },
      });
      const unpaidOrders = await this.orderService.countByStatus(OrderStatus.PENDING);

      return {
        total_users: totalUsers,
        pending_seller_applications: pendingSellers,
        pending_vet_applications: pendingVets,
        pending_pet_listings: pendingPets,
        auction_requests: auctionRequests,
        live_auctions: liveAuctions,
        today_consultations: todayConsultations,
        unpaid_orders: unpaidOrders,
      };
    } catch (error) {
      throw error;
    }
  }
}
