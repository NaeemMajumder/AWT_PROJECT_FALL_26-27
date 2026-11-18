import { IsEnum, IsOptional } from "class-validator";
import { ProfileStatus } from "@/common/enums/profile-status.enum";

export class ApplicationQueryDto {
  @IsOptional()
  @IsEnum(ProfileStatus)
  status?: ProfileStatus;
}
