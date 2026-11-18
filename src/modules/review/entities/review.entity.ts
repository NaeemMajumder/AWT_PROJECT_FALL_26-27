import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";

@Entity({ name: "reviews" })
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  reviewer_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewer_id" })
  reviewer!: User;

  @Column({ type: "uuid", nullable: true })
  seller_id?: string | null;

  @Column({ type: "uuid", nullable: true })
  vet_id?: string | null;

  @Column({ type: "uuid", nullable: true })
  order_id?: string | null;

  @Column({ type: "uuid", nullable: true })
  consultation_id?: string | null;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment?: string | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
