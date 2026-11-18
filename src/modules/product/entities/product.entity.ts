import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  seller_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "seller_id" })
  seller!: User;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ type: "varchar", nullable: true })
  for_species?: string | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ type: "varchar", nullable: true })
  image_path?: string | null;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
