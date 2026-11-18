import { IsEnum, IsOptional } from "class-validator";
import { PaymentMethod } from "@/common/enums/payment.enum";

export class PayOrderDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
