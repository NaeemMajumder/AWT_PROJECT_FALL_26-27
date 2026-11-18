export interface CreatePetOrderInput {
  buyerId: string;
  sellerId: string;
  petId: string;
  price: number;
  source: "request" | "auction";
  payBy: Date;
}
export interface TeamAOrdersService {
  createPetOrder(input: CreatePetOrderInput): Promise<unknown>;
}
export interface TeamANotificationsService {
  notify(userId: string, type: string, message: string): Promise<unknown>;
}
export interface TeamAStorageService {
  save(file: Express.Multer.File): Promise<string>;
}
export interface TeamAVetsService {
  getApprovedVet(vetId: string): Promise<{
    id: string; user_id: string; work_start: string; work_end: string;
    slot_minutes: number; modes: string[];
  }>;
  getVetProfileByUserId(userId: string): Promise<{ id: string }>;
}
