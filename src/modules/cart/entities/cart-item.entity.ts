import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "@/modules/product/entities/product.entity";

@Entity({ name: "cart_items" })
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  cart_id!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart!: Cart;

  @Column({ type: "uuid" })
  product_id!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ type: "int" })
  quantity!: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
