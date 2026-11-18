import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ConsultationMode } from "../../../common/enums/consultation.enum";
export class CreateConsultationDto {
  @IsUUID() vet_id!: string;
  @IsUUID() species_id!: string;
  @IsString() @IsNotEmpty() pet_name!: string;
  @IsString() @IsNotEmpty() problem_note!: string;
  @IsDateString() date!: string;
  @IsString() @IsNotEmpty() start_time!: string;
  @IsEnum(ConsultationMode) mode!: ConsultationMode;
}
