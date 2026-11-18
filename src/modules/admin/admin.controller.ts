import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ApplicationQueryDto } from "./dto/admin.dto";
import { UserService } from "../user/user.service";
import { SellerService } from "../seller/seller.service";
import { VetService } from "../vet/vet.service";
import { OrderService } from "../order/order.service";
import { ReviewApplicationDto } from "../seller/dto/seller.dto";
import { OrderQueryDto, UpdateOrderStatusDto } from "../order/dto/order.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("admin")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly sellerService: SellerService,
    private readonly vetService: VetService,
    private readonly orderService: OrderService,
  ) {}

  @Get("summary")
  async getSummary() {
    return await this.adminService.getSummary();
  }

  @Get("users")
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Patch("users/:id/deactivate")
  async deactivateUser(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() admin: AuthUser) {
    return await this.adminService.deactivateUser(id, admin.id);
  }

  @Patch("users/:id/activate")
  async activateUser(@Param("id", ParseUUIDPipe) id: string) {
    return await this.adminService.activateUser(id);
  }

  @Get("sellers")
  async getSellerApplications(@Query() query: ApplicationQueryDto) {
    return await this.sellerService.getApplications(query.status);
  }

  @Patch("sellers/:id/review")
  async reviewSeller(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ReviewApplicationDto) {
    return await this.sellerService.review(id, dto);
  }

  @Get("vets")
  async getVetApplications(@Query() query: ApplicationQueryDto) {
    return await this.vetService.getApplications(query.status);
  }

  @Patch("vets/:id/review")
  async reviewVet(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ReviewApplicationDto) {
    return await this.vetService.review(id, dto);
  }

  @Get("orders")
  async getOrders(@Query() query: OrderQueryDto) {
    return await this.orderService.getAllOrders(query);
  }

  @Patch("orders/:id/status")
  async updateOrderStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return await this.orderService.updateStatusByAdmin(id, dto);
  }
}
