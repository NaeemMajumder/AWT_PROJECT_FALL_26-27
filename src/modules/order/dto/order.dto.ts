import { IsEnum, IsIn, IsOptional } from "class-validator";
import { OrderStatus, OrderType } from "@/common/enums/order.enum";
import { PaymentMethod } from "@/common/enums/payment.enum";

export class CheckoutDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;
}

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class UpdateOrderStatusDto {
  @IsIn([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
  status!: OrderStatus;
}
