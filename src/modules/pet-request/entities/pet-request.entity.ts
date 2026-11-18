import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pet } from "@/modules/pet/entities/pet.entity";
import { User } from "@/modules/user/entities/user.entity";
import { RequestStatus, RequestType } from "@/common/enums/pet-request.enum";

@Entity({ name: "pet_requests" })
export class PetRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  pet_id!: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: "pet_id" })
  pet!: Pet;

  @Column({ type: "uuid" })
  requester_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "requester_id" })
  requester!: User;

  @Column({ type: "enum", enum: RequestType })
  type!: RequestType;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "enum", enum: RequestStatus, default: RequestStatus.PENDING })
  status!: RequestStatus;

  @Column({ type: "timestamp", nullable: true })
  decided_at?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
