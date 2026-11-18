import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { ConsultationMode } from "@/common/enums/consultation.enum";

export class CreateConsultationDto {
  @IsUUID()
  vet_id!: string;

  @IsUUID()
  species_id!: string;

  @IsString()
  @IsNotEmpty()
  pet_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  problem_note!: string;

  @IsDateString()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "start_time must be in HH:mm format" })
  start_time!: string;

  @IsEnum(ConsultationMode)
  mode!: ConsultationMode;
}

export class VetScheduleQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
