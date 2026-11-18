import { OrderSource } from "@/common/enums/order.enum";

export interface OrderEventPayload {
  orderId: string;
  petId: string;
  source: OrderSource;
  sourceId: string;
}
