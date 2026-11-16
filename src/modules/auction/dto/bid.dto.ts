import { IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
export class PlaceBidDto {
  @Type(() => Number) @IsNumber() @Min(1) amount!: number;
}
export class EditBidDto {
  @Type(() => Number) @IsNumber() @Min(1) amount!: number;
}
