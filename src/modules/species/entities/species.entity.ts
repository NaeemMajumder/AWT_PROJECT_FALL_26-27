
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "species" })
export class Species {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  category!: string;

  @Column({ name: "min_age_weeks", type: "int", nullable: true })
  min_age_weeks!: number | null;

  @Column({ name: "vaccination_required", type: "boolean", default: false })
  vaccination_required!: boolean;

  @Column({ name: "is_allowed", type: "boolean", default: true })
  is_allowed!: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;
}
