import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";
export class CreateAuctionDto {
  @IsUUID() pet_id!: string;
  @Type(() => Number) @IsNumber() @Min(50000) start_price!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(48) duration_hours!: number;
}
export class ReviewAuctionDto {
  @IsIn(["approved", "rejected"]) decision!: "approved" | "rejected";
  @IsOptional() @IsDateString() start_time?: string;
}
export class PriceDropDecisionDto {
  @IsIn(["accept", "withdraw"]) decision!: "accept" | "withdraw";
}
