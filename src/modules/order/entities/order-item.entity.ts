import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "@/modules/product/entities/product.entity";

@Entity({ name: "order_items" })
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  order_id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ type: "uuid" })
  seller_id!: string;

  @Column({ type: "uuid", nullable: true })
  product_id?: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "product_id" })
  product?: Product | null;

  @Column({ type: "uuid", nullable: true })
  pet_id?: string | null;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  unit_price!: number;
}
