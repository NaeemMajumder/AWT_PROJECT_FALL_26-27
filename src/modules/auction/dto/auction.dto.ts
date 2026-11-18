import { Type } from "class-transformer";
import { IsDateString, IsIn, IsNumber, IsOptional, IsUUID, Max, Min } from "class-validator";
import { MAX_DURATION_HOURS, MIN_START_PRICE } from "@/common/constants/auction.constants";

export class CreateAuctionDto {
  @IsUUID()
  pet_id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(MIN_START_PRICE, { message: "Starting price must be at least BDT 50,000" })
  start_price!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.05)
  @Max(MAX_DURATION_HOURS, { message: "An auction can run for at most 48 hours" })
  duration_hours!: number;
}

export class ReviewAuctionDto {
  @IsIn(["approved", "rejected"])
  decision!: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;
}

export class PriceDropDecisionDto {
  @IsIn(["accept", "withdraw"])
  decision!: string;
}
