import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn, Unique,
} from "typeorm";
import { Auction } from "./auction.entity";
import { User } from "../../user/entities/user.entity";

@Entity({ name: "bids" })
@Unique(["auction_id", "bidder_id"])
export class Bid {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  auction_id!: string;

  @ManyToOne(() => Auction)
  @JoinColumn({ name: "auction_id" })
  auction!: Auction;

  @Column({ type: "uuid" })
  bidder_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "bidder_id" })
  bidder!: User;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "int", default: 0 })
  edit_count!: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
