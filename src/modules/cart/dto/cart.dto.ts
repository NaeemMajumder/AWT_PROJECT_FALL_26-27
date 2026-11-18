import { Type } from "class-transformer";
import { IsInt, IsUUID, Min } from "class-validator";

export class AddCartItemDto {
  @IsUUID()
  product_id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
