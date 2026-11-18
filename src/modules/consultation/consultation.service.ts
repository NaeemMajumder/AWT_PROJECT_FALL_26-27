import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consultation } from "./entities/consultation.entity";
import { CreateConsultationDto } from "./dto/consultation.dto";
import { ConsultationMode, ConsultationStatus } from "../../common/enums/consultation.enum";
import { MeetingService } from "../../providers/meeting/jitsi/meeting.service";
import { TeamAVetsService } from "../../common/interfaces/team-a-handshake.interface";

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation) private readonly consultationRepository: Repository<Consultation>,
    private readonly meetingService: MeetingService,
    @Optional() @Inject("TEAM_A_VET_SERVICE") private readonly vetService?: TeamAVetsService,
  ) {}

  private toMinutes(value: string) {
    const parts = value.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }
  private toTime(value: number) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}:00`;
  }

  async createConsultation(userId: string, dto: CreateConsultationDto) {
    if (!this.vetService) throw new BadRequestException("Vet booking is waiting for Team A handshake: VetsService.getApprovedVet()");
    const vet = await this.vetService.getApprovedVet(dto.vet_id);
    if (!vet) throw new NotFoundException("Approved vet not found");
    const today = new Date();
    const bookingDate = new Date(`${dto.date}T${dto.start_time}:00`);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate <= today) throw new BadRequestException("Booking date and time must be in the future");
    if (!vet.modes.includes(dto.mode)) throw new BadRequestException("This vet does not offer the selected consultation mode");
    const startMinutes = this.toMinutes(dto.start_time);
    const endMinutes = startMinutes + vet.slot_minutes;
    if (startMinutes < this.toMinutes(vet.work_start) || endMinutes > this.toMinutes(vet.work_end)) {
      throw new BadRequestException("The selected time is outside the vet's working hours");
    }
    const endTime = this.toTime(endMinutes);
    const overlaps = await this.consultationRepository.createQueryBuilder("consultation")
      .where("consultation.date = :date", { date: dto.date })
      .andWhere("consultation.status != :cancelled", { cancelled: ConsultationStatus.CANCELLED })
      .andWhere("consultation.start_time < :endTime AND consultation.end_time > :startTime", {
        startTime: `${dto.start_time}:00`, endTime,
      })
      .andWhere("(consultation.vet_id = :vetId OR consultation.user_id = :userId)", {
        vetId: dto.vet_id, userId,
      }).getOne();
    if (overlaps) throw new ConflictException("This time overlaps with another consultation");
    const roomCode = dto.mode === ConsultationMode.ONLINE ? this.meetingService.createRoomCode() : undefined;
    const consultation = this.consultationRepository.create({
      ...dto, user_id: userId, end_time: endTime, room_code: roomCode,
      status: ConsultationStatus.PENDING,
    });
    return await this.consultationRepository.save(consultation);
  }

  async getMyConsultations(userId: string) {
    return await this.consultationRepository.find({ where: { user_id: userId }, order: { date: "DESC", start_time: "DESC" } });
  }

  async getVetConsultations(userId: string, date?: string) {
    if (!this.vetService) throw new BadRequestException("Vet booking is waiting for Team A vet service handshake");
    const vetProfile = await this.vetService.getVetProfileByUserId(userId);
    const where: any = { vet_id: vetProfile.id };
    if (date) where.date = date;
    return await this.consultationRepository.find({ where, order: { date: "ASC", start_time: "ASC" } });
  }

  async changeStatus(id: string, userId: string, status: ConsultationStatus) {
    if (!this.vetService) throw new BadRequestException("Vet access is waiting for Team A vet service handshake");
    const vetProfile = await this.vetService.getVetProfileByUserId(userId);
    const consultation = await this.consultationRepository.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException("Consultation not found");
    if (consultation.vet_id !== vetProfile.id) throw new ForbiddenException("You can update only your own consultations");
    if (consultation.status === ConsultationStatus.CANCELLED || consultation.status === ConsultationStatus.COMPLETED) {
      throw new ConflictException("This consultation is already closed");
    }
    if (status === ConsultationStatus.CONFIRMED && consultation.status !== ConsultationStatus.PENDING) {
      throw new ConflictException("Only pending consultations can be confirmed");
    }
    if (status === ConsultationStatus.COMPLETED && consultation.status !== ConsultationStatus.CONFIRMED) {
      throw new ConflictException("Only confirmed consultations can be completed");
    }
    consultation.status = status;
    return await this.consultationRepository.save(consultation);
  }

  async cancelConsultation(id: string, userId: string) {
    const consultation = await this.consultationRepository.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException("Consultation not found");
    if (consultation.user_id !== userId) throw new ForbiddenException("You can cancel only your own booking");
    const start = new Date(`${consultation.date}T${consultation.start_time}`);
    if (start <= new Date()) throw new BadRequestException("A consultation cannot be cancelled after it starts");
    consultation.status = ConsultationStatus.CANCELLED;
    return await this.consultationRepository.save(consultation);
  }

  async joinCall(id: string, userId: string, isVet: boolean) {
    const consultation = await this.consultationRepository.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException("Consultation not found");
    if (!isVet && consultation.user_id !== userId) throw new ForbiddenException("This call is not yours");
    if (isVet) {
      if (!this.vetService) throw new ForbiddenException("Vet access is not configured");
      const vetProfile = await this.vetService.getVetProfileByUserId(userId);
      if (consultation.vet_id !== vetProfile.id) throw new ForbiddenException("This is not your consultation");
    }
    if (consultation.mode !== ConsultationMode.ONLINE || !consultation.room_code) throw new BadRequestException("This is not an online consultation");
    const start = new Date(`${consultation.date}T${consultation.start_time}`);
    const end = new Date(`${consultation.date}T${consultation.end_time}`);
    const now = new Date();
    if (now < new Date(start.getTime() - 10 * 60 * 1000) || now > end) throw new ForbiddenException("The call link is available from 10 minutes before the booking until its end");
    return { meeting_url: this.meetingService.getMeetingUrl(consultation.room_code) };
  }

  async isCompleted(id: string, userId: string) {
    const consultation = await this.consultationRepository.findOne({ where: { id, user_id: userId, status: ConsultationStatus.COMPLETED } });
    return !!consultation;
  }
}
