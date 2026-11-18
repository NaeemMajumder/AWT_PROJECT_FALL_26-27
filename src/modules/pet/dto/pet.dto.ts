import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";
import { ListingType, PetGender, PetStatus } from "../../../common/enums/pet.enum";

export class CreatePetDto {
  @IsUUID() species_id!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() breed!: string;
  @IsEnum(PetGender) gender!: PetGender;
  @IsDateString() birth_date!: string;
  @Transform(({ value }) => value === true || value === "true") @IsBoolean() vaccinated!: boolean;
  @IsEnum(ListingType) listing_type!: ListingType;
  @IsOptional() @Transform(({ value }) => value === true || value === "true") @IsBoolean() is_rescue?: boolean;
  @IsString() @IsNotEmpty() district!: string;
  @IsString() @IsNotEmpty() area!: string;
  @Type(() => Number) @IsNumber() @Min(0) price!: number;
}
export class UpdatePetDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() @IsNotEmpty() breed?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() area?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @Transform(({ value }) => value === true || value === "true") @IsBoolean() vaccinated?: boolean;
}
export class PetSearchQueryDto {
  @IsOptional() @IsUUID() species_id?: string;
  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsEnum(ListingType) listing_type?: ListingType;
  @IsOptional() @Transform(({ value }) => value === true || value === "true") @IsBoolean() is_rescue?: boolean;
}
export class ReviewPetDto {
  @IsEnum(PetStatus) status!: PetStatus;
}
