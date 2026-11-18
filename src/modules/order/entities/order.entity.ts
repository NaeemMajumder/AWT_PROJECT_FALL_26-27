import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { OrderSource, OrderStatus, OrderType } from "@/common/enums/order.enum";

@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  buyer_id!: string;

  @Column({ type: "enum", enum: OrderType })
  order_type!: OrderType;

  @Column({ type: "enum", enum: OrderSource })
  source!: OrderSource;

  @Column({ type: "uuid", nullable: true })
  source_id?: string | null;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total_amount!: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: "timestamp", nullable: true })
  pay_by?: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
