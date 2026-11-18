import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Species } from "../../species/entities/species.entity";
import { ConsultationMode, ConsultationStatus } from "../../../common/enums/consultation.enum";

@Entity({ name: "consultations" })
export class Consultation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  vet_id!: string;

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

  @Column({ type: "enum", enum: ConsultationMode, enumName: "consultation_mode_enum" })
  mode!: ConsultationMode;

  @Column({ nullable: true })
  room_code?: string;

  @Column({ type: "enum", enum: ConsultationStatus, enumName: "consultation_status_enum", default: ConsultationStatus.PENDING })
  status!: ConsultationStatus;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
