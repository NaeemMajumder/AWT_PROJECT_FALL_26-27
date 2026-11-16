import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Bid } from "./bid.entity";

@Entity({ name: "bid_revisions" })
export class BidRevision {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  bid_id!: string;

  @ManyToOne(() => Bid)
  @JoinColumn({ name: "bid_id" })
  bid!: Bid;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  old_amount!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  new_amount!: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
