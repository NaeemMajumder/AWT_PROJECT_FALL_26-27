import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { ProfileStatus } from "@/common/enums/profile-status.enum";

@Entity({ name: "vet_profiles" })
export class VetProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  user_id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ unique: true })
  registration_no!: string;

  @Column()
  specialisation!: string;

  @Column()
  district!: string;

  @Column()
  upazila!: string;

  @Column()
  chamber_address!: string;

  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  fee!: number;

  @Column({ type: "time", default: "10:00" })
  work_start!: string;

  @Column({ type: "time", default: "18:00" })
  work_end!: string;

  @Column({ type: "int", default: 30 })
  slot_minutes!: number;

  @Column({ type: "simple-array" })
  modes!: string[];

  @Column({ type: "enum", enum: ProfileStatus, default: ProfileStatus.PENDING })
  status!: ProfileStatus;

  @Column({ type: "varchar", nullable: true })
  reject_reason?: string | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
