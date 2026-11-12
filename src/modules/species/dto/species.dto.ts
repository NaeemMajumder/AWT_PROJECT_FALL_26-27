
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateSpeciesDto {
  @IsString()
  @IsNotEmpty()
  name: string = "";

  @IsString()
  @IsNotEmpty()
  category: string = "";

  @IsOptional()
  @IsInt()
  @Min(0)
  min_age_weeks?: number | null;

  @IsOptional()
  @IsBoolean()
  vaccination_required?: boolean;

  @IsOptional()
  @IsBoolean()
  is_allowed?: boolean;
}

export class UpdateSpeciesDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_age_weeks?: number | null;

  @IsOptional()
  @IsBoolean()
  vaccination_required?: boolean;

  @IsOptional()
  @IsBoolean()
  is_allowed?: boolean;
}
