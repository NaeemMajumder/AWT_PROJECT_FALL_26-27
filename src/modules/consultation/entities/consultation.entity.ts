import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { Species } from "@/modules/species/entities/species.entity";
import { VetProfile } from "@/modules/vet/entities/vet-profile.entity";
import { ConsultationMode, ConsultationStatus } from "@/common/enums/consultation.enum";

@Entity({ name: "consultations" })
export class Consultation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  vet_id!: string;

  @ManyToOne(() => VetProfile)
  @JoinColumn({ name: "vet_id" })
  vet!: VetProfile;

  @Column({ type: "uuid" })
  user_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "uuid" })
  species_id!: string;

  @ManyToOne(() => Species)
  @JoinColumn({ name: "species_id" })
  species!: Species;

  @Column()
  pet_name!: string;

  @Column({ type: "text" })
  problem_note!: string;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "time" })
  start_time!: string;

  @Column({ type: "time" })
  end_time!: string;

  @Column({ type: "enum", enum: ConsultationMode })
  mode!: ConsultationMode;

  @Column({ type: "varchar", nullable: true })
  room_code?: string | null;

  @Column({ type: "enum", enum: ConsultationStatus, default: ConsultationStatus.PENDING })
  status!: ConsultationStatus;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
