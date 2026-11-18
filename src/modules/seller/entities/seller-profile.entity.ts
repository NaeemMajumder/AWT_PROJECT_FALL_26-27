import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { ProfileStatus, SellerType } from "@/common/enums/profile-status.enum";

@Entity({ name: "seller_profiles" })
export class SellerProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  user_id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  shop_name!: string;

  @Column({ type: "enum", enum: SellerType, default: SellerType.INDIVIDUAL })
  seller_type!: SellerType;

  @Column({ nullable: true, select: false })
  document_path?: string;

  @Column({ type: "enum", enum: ProfileStatus, default: ProfileStatus.PENDING })
  status!: ProfileStatus;

  @Column({ type: "varchar", nullable: true })
  reject_reason?: string | null;

  @Column({ type: "timestamp", nullable: true })
  reviewed_at?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
