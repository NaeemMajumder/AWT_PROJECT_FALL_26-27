import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Pet } from "../../pet/entities/pet.entity";
import { AuctionStatus } from "../../../common/enums/auction.enum";

@Entity({ name: "auctions" })
export class Auction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  pet_id!: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: "pet_id" })
  pet!: Pet;

  @Column({ type: "uuid" })
  seller_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "seller_id" })
  seller!: User;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  start_price!: number;

  @Column({ type: "int", default: 1 })
  round_no!: number;

  @Column({ type: "int" })
  duration_hours!: number;

  @Column({ type: "timestamp", nullable: true })
  start_time?: Date;

  @Column({ type: "timestamp", nullable: true })
  end_time?: Date;

  @Column({ type: "int", default: 0 })
  extension_count!: number;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  highest_bid?: number;

  @Column({ type: "uuid", nullable: true })
  highest_bidder_id?: string;

  @Column({ type: "enum", enum: AuctionStatus, enumName: "auction_status_enum", default: AuctionStatus.REQUESTED })
  status!: AuctionStatus;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  offer_price?: number;

  @Column({ type: "timestamp", nullable: true })
  offer_expires_at?: Date;

  @Column({ type: "uuid", nullable: true })
  winner_id?: string;

  @Column({ type: "uuid", nullable: true })
  approved_by?: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
