import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { ConsultationMode } from "@/common/enums/consultation.enum";
import { IsBdDistrict } from "@/common/validations/district.validator";

export class CreateVetApplicationDto {
  @IsString()
  @IsNotEmpty()
  registration_no!: string;

  @IsString()
  @IsNotEmpty()
  specialisation!: string;

  @IsBdDistrict()
  district!: string;

  @IsString()
  @IsNotEmpty()
  upazila!: string;

  @IsString()
  @IsNotEmpty()
  chamber_address!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn([ConsultationMode.ONLINE, ConsultationMode.CHAMBER], { each: true })
  modes!: string[];
}

export class UpdateVetProfileDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "work_start must be like 09:00" })
  work_start?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "work_end must be like 17:00" })
  work_end?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(120)
  slot_minutes?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn([ConsultationMode.ONLINE, ConsultationMode.CHAMBER], { each: true })
  modes?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  chamber_address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  specialisation?: string;
}

export class VetSearchQueryDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  upazila?: string;

  @IsOptional()
  @IsIn([ConsultationMode.ONLINE, ConsultationMode.CHAMBER])
  mode?: string;
}
