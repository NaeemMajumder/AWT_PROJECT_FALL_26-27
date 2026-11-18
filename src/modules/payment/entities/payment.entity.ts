import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "@/modules/order/entities/order.entity";
import { PaymentMethod, PaymentStatus } from "@/common/enums/payment.enum";

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  order_id!: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ type: "enum", enum: PaymentMethod, default: PaymentMethod.ONLINE_SIMULATED })
  method!: PaymentMethod;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "varchar", nullable: true })
  transaction_ref?: string | null;

  @Column({ type: "timestamp", nullable: true })
  paid_at?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
