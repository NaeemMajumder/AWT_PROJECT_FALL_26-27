import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "species" })
export class Species {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  category!: string;

  @Column({ type: "int", default: 0 })
  min_age_weeks!: number;

  @Column({ default: false })
  vaccination_required!: boolean;

  @Column({ default: true })
  is_allowed!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
