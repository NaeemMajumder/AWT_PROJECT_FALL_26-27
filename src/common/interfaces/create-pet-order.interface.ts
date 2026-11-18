import { OrderSource } from "@/common/enums/order.enum";

export interface CreatePetOrderInput {
  buyerId: string;
  sellerId: string;
  petId: string;
  amount: number;
  source: OrderSource;
  sourceId: string;
}
