import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NotificationType } from "@/common/enums/notification-type.enum";

@Entity({ name: "notifications" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "enum", enum: NotificationType })
  type!: NotificationType;

  @Column()
  message!: string;

  @Column({ type: "uuid", nullable: true })
  auction_id?: string | null;

  @Column({ default: false })
  is_read!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
