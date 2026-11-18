import { Body, Controller, Get, Post, Patch, Param, Query, UseGuards } from "@nestjs/common";
import { ConsultationService } from "./consultation.service";
import { CreateConsultationDto } from "./dto/consultation.dto";
import { JwtGuard } from "../../common/guard/jwt.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";
import { ConsultationStatus } from "../../common/enums/consultation.enum";

@Controller("consultations")
@UseGuards(JwtGuard)
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  async createConsultation(@CurrentUser() user: AuthUser, @Body() dto: CreateConsultationDto) {
    return await this.consultationService.createConsultation(user.id, dto);
  }

  @Get("my")
  async getMyConsultations(@CurrentUser() user: AuthUser) {
    return await this.consultationService.getMyConsultations(user.id);
  }

  @Get("vet")
  async getVetConsultations(@CurrentUser() user: AuthUser, @Query("date") date?: string) {
    return await this.consultationService.getVetConsultations(user.id, date);
  }

  @Patch(":id/confirm")
  async confirm(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.CONFIRMED);
  }

  @Patch(":id/complete")
  async complete(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.COMPLETED);
  }

  @Patch(":id/vet-cancel")
  async vetCancel(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.CANCELLED);
  }

  @Patch(":id/cancel")
  async cancel(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.cancelConsultation(id, user.id);
  }

  @Get(":id/join")
  async joinCall(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const isVet = user.roles?.some((role) => ["VET", "ROLE_VET"].includes(role)) || false;
    return await this.consultationService.joinCall(id, user.id, isVet);
  }
}
