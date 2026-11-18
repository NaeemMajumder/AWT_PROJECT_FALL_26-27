import { Body, Controller, Get, Post, Patch, Param, UseGuards } from "@nestjs/common";
import { PetRequestService } from "./pet-request.service";
import { CreatePetRequestDto } from "./dto/pet-request.dto";
import { JwtGuard } from "../../common/guard/jwt.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("pet-requests")
@UseGuards(JwtGuard)
export class PetRequestController {
  constructor(private readonly requestService: PetRequestService) {}

  @Post()
  async createRequest(@CurrentUser() user: AuthUser, @Body() dto: CreatePetRequestDto) {
    return await this.requestService.createRequest(user.id, dto);
  }

  @Get("my")
  async getMyRequests(@CurrentUser() user: AuthUser) {
    return await this.requestService.getMyRequests(user.id);
  }

  @Get("pet/:petId")
  async getPetRequests(@Param("petId") petId: string, @CurrentUser() user: AuthUser) {
    return await this.requestService.getPetRequests(petId, user.id);
  }

  @Patch(":id/accept")
  async acceptRequest(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.requestService.acceptRequest(id, user.id);
  }

  @Patch(":id/reject")
  async rejectRequest(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.requestService.rejectRequest(id, user.id);
  }

  @Patch(":id/cancel")
  async cancelRequest(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.requestService.cancelRequest(id, user.id);
  }
}
