import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { RequestType } from "@/common/enums/pet-request.enum";

export class CreatePetRequestDto {
  @IsUUID()
  pet_id!: string;

  @IsEnum(RequestType)
  type!: RequestType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;
}
