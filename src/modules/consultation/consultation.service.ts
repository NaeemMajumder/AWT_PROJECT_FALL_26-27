import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Not, Repository } from "typeorm";
import { Consultation } from "./entities/consultation.entity";
import { VetProfile } from "../vet/entities/vet-profile.entity";
import { CreateConsultationDto } from "./dto/consultation.dto";
import { VetService } from "../vet/vet.service";
import { MeetingService } from "@/providers/meeting/jitsi/meeting.service";
import { ConsultationMode, ConsultationStatus } from "@/common/enums/consultation.enum";
import { ProfileStatus } from "@/common/enums/profile-status.enum";

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation) private readonly consultationRepository: Repository<Consultation>,
    private readonly dataSource: DataSource,
    private readonly vetService: VetService,
    private readonly meetingService: MeetingService,
  ) {}

  toMinutes(value: string) {
    const parts = value.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  toTime(minutes: number) {
    let hour = String(Math.floor(minutes / 60));
    let minute = String(minutes % 60);
    if (hour.length < 2) hour = "0" + hour;
    if (minute.length < 2) minute = "0" + minute;
    return hour + ":" + minute + ":00";
  }

  async createConsultation(userId: string, dto: CreateConsultationDto) {
    try {
      const startAt = new Date(dto.date + "T" + dto.start_time + ":00");
      if (isNaN(startAt.getTime()) || startAt <= new Date()) {
        throw new BadRequestException("Booking time must be in the future");
      }

      return await this.dataSource.transaction(async (manager) => {
        const vet = await manager.findOne(VetProfile, {
          where: { id: dto.vet_id },
          lock: { mode: "pessimistic_write" },
        });
        if (!vet || vet.status !== ProfileStatus.APPROVED) {
          throw new NotFoundException("Vet not found");
        }
        if (vet.user_id === userId) {
          throw new BadRequestException("You can not book yourself");
        }
        if (!vet.modes.includes(dto.mode)) {
          throw new BadRequestException("This vet does not take " + dto.mode + " consultations");
        }

        const startMinutes = this.toMinutes(dto.start_time);
        const endMinutes = startMinutes + vet.slot_minutes;
        if (startMinutes < this.toMinutes(vet.work_start) || endMinutes > this.toMinutes(vet.work_end)) {
          throw new BadRequestException(
            "Vet works from " + vet.work_start.slice(0, 5) + " to " + vet.work_end.slice(0, 5),
          );
        }

        const startTime = dto.start_time + ":00";
        const endTime = this.toTime(endMinutes);

        const clash = await manager
          .getRepository(Consultation)
          .createQueryBuilder("c")
          .where("c.date = :date", { date: dto.date })
          .andWhere("c.status IN (:...statuses)", {
            statuses: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED],
          })
          .andWhere("c.start_time < :endTime", { endTime: endTime })
          .andWhere("c.end_time > :startTime", { startTime: startTime })
          .andWhere("(c.vet_id = :vetId OR c.user_id = :userId)", { vetId: vet.id, userId: userId })
          .getOne();
        if (clash) {
          throw new ConflictException("This slot is already booked");
        }

        let roomCode = null;
        if (dto.mode === ConsultationMode.ONLINE) {
          roomCode = this.meetingService.createRoomCode();
        }

        const consultation = manager.create(Consultation, {
          vet_id: vet.id,
          user_id: userId,
          species_id: dto.species_id,
          pet_name: dto.pet_name,
          problem_note: dto.problem_note,
          date: dto.date,
          start_time: startTime,
          end_time: endTime,
          mode: dto.mode,
          room_code: roomCode,
          status: ConsultationStatus.PENDING,
        });
        return await manager.save(consultation);
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyConsultations(userId: string) {
    try {
      return await this.consultationRepository.find({
        where: { user_id: userId },
        relations: ["vet", "species"],
        order: { date: "DESC", start_time: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVetConsultations(userId: string, date?: string) {
    try {
      const vet = await this.vetService.getVetProfileByUserId(userId);
      const where: any = { vet_id: vet.id };
      if (date) {
        where.date = date;
      }
      return await this.consultationRepository.find({
        where: where,
        relations: ["species"],
        order: { date: "ASC", start_time: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getBookedSlots(vetId: string, date: string) {
    try {
      await this.vetService.getApprovedVet(vetId);
      const list = await this.consultationRepository.find({
        where: { vet_id: vetId, date: date, status: Not(ConsultationStatus.CANCELLED) },
        order: { start_time: "ASC" },
      });
      return list.map((item) => ({
        start_time: item.start_time.slice(0, 5),
        end_time: item.end_time.slice(0, 5),
      }));
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(id: string, userId: string, status: ConsultationStatus) {
    try {
      const vet = await this.vetService.getVetProfileByUserId(userId);
      const consultation = await this.consultationRepository.findOne({ where: { id: id } });
      if (!consultation) {
        throw new NotFoundException("Consultation not found");
      }
      if (consultation.vet_id !== vet.id) {
        throw new ForbiddenException("This is not your consultation");
      }
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
    } catch (error) {
      throw error;
    }
  }

  async cancelConsultation(id: string, userId: string) {
    try {
      const consultation = await this.consultationRepository.findOne({ where: { id: id } });
      if (!consultation) {
        throw new NotFoundException("Consultation not found");
      }
      if (consultation.user_id !== userId) {
        throw new ForbiddenException("You can cancel only your own booking");
      }
      if (consultation.status !== ConsultationStatus.PENDING && consultation.status !== ConsultationStatus.CONFIRMED) {
        throw new ConflictException("This consultation can not be cancelled");
      }
      const start = new Date(consultation.date + "T" + consultation.start_time);
      if (start <= new Date()) {
        throw new BadRequestException("You can not cancel after the consultation has started");
      }
      consultation.status = ConsultationStatus.CANCELLED;
      return await this.consultationRepository.save(consultation);
    } catch (error) {
      throw error;
    }
  }

  async joinCall(id: string, userId: string) {
    try {
      const consultation = await this.consultationRepository.findOne({
        where: { id: id },
        relations: ["vet"],
      });
      if (!consultation) {
        throw new NotFoundException("Consultation not found");
      }
      if (consultation.user_id !== userId && consultation.vet.user_id !== userId) {
        throw new ForbiddenException("This call is not yours");
      }
      if (consultation.mode !== ConsultationMode.ONLINE || !consultation.room_code) {
        throw new BadRequestException("This is a chamber visit, not an online call");
      }
      if (consultation.status !== ConsultationStatus.CONFIRMED) {
        throw new ForbiddenException("The vet has not confirmed this booking yet");
      }

      const start = new Date(consultation.date + "T" + consultation.start_time);
      const end = new Date(consultation.date + "T" + consultation.end_time);
      const now = new Date();
      if (now.getTime() < start.getTime() - 10 * 60 * 1000 || now > end) {
        throw new ForbiddenException("The call link opens 10 minutes before the booking time");
      }

      return {
        meeting_url: this.meetingService.getMeetingUrl(consultation.room_code),
        start_time: start,
        end_time: end,
      };
    } catch (error) {
      throw error;
    }
  }

  async getCompletedForReview(id: string, userId: string) {
    const consultation = await this.consultationRepository.findOne({ where: { id: id } });
    if (!consultation) {
      throw new NotFoundException("Consultation not found");
    }
    if (consultation.user_id !== userId) {
      throw new ForbiddenException("You can review only your own consultation");
    }
    if (consultation.status !== ConsultationStatus.COMPLETED) {
      throw new BadRequestException("You can review only after the consultation is completed");
    }
    return consultation;
  }

  async countAll() {
    return await this.consultationRepository.count();
  }
}
