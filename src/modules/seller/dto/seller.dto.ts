import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ProfileStatus, SellerType } from "@/common/enums/profile-status.enum";

export class CreateSellerApplicationDto {
  @IsString()
  @IsNotEmpty()
  shop_name!: string;

  @IsEnum(SellerType)
  seller_type!: SellerType;
}

export class ReviewApplicationDto {
  @IsIn([ProfileStatus.APPROVED, ProfileStatus.REJECTED])
  status!: ProfileStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
