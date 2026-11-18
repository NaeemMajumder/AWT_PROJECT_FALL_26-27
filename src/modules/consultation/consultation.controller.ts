import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ConsultationService } from "./consultation.service";
import { CreateConsultationDto, VetScheduleQueryDto } from "./dto/consultation.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { ApprovedVetGuard } from "@/common/guard/approved-vet.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { ConsultationStatus } from "@/common/enums/consultation.enum";

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
  @UseGuards(ApprovedVetGuard)
  async getVetConsultations(@CurrentUser() user: AuthUser, @Query() query: VetScheduleQueryDto) {
    return await this.consultationService.getVetConsultations(user.id, query.date);
  }

  @Get("slots/:vetId")
  async getBookedSlots(@Param("vetId", ParseUUIDPipe) vetId: string, @Query("date") date: string) {
    return await this.consultationService.getBookedSlots(vetId, date);
  }

  @Patch(":id/confirm")
  @UseGuards(ApprovedVetGuard)
  async confirm(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.CONFIRMED);
  }

  @Patch(":id/complete")
  @UseGuards(ApprovedVetGuard)
  async complete(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.COMPLETED);
  }

  @Patch(":id/vet-cancel")
  @UseGuards(ApprovedVetGuard)
  async vetCancel(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.changeStatus(id, user.id, ConsultationStatus.CANCELLED);
  }

  @Patch(":id/cancel")
  async cancel(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.cancelConsultation(id, user.id);
  }

  @Get(":id/join")
  async joinCall(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return await this.consultationService.joinCall(id, user.id);
  }
}
