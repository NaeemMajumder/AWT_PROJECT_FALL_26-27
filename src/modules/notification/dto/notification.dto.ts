import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class NotificationQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  unread_only?: boolean;
}
