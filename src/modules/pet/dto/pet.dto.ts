import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { ListingType, PetGender, PetStatus } from "@/common/enums/pet.enum";
import { IsBdDistrict } from "@/common/validations/district.validator";

export class CreatePetDto {
  @IsUUID()
  species_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  breed!: string;

  @IsEnum(PetGender)
  gender!: PetGender;

  @IsDateString()
  birth_date!: string;

  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  vaccinated!: boolean;

  @IsEnum(ListingType)
  listing_type!: ListingType;

  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  is_rescue?: boolean;

  @IsBdDistrict()
  district!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  breed?: string;

  @IsOptional()
  @IsBdDistrict()
  district?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  vaccinated?: boolean;
}

export class PetSearchQueryDto {
  @IsOptional()
  @IsUUID()
  species_id?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(ListingType)
  listing_type?: ListingType;

  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  is_rescue?: boolean;
}

export class ReviewPetDto {
  @IsIn([PetStatus.AVAILABLE, PetStatus.REJECTED])
  status!: PetStatus;
}
