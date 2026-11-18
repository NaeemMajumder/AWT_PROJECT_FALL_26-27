import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consultation } from "./entities/consultation.entity";
import { ConsultationController } from "./consultation.controller";
import { ConsultationService } from "./consultation.service";
import { VetModule } from "../vet/vet.module";
import { MeetingModule } from "@/providers/meeting/jitsi/meeting.module";

@Module({
  imports: [TypeOrmModule.forFeature([Consultation]), VetModule, MeetingModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
