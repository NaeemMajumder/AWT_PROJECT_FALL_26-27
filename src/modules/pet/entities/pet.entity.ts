import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Species } from "../../species/entities/species.entity";
import { ListingType, PetGender, PetStatus } from "../../../common/enums/pet.enum";

@Entity({ name: "pets" })
export class Pet {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  owner_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({ type: "uuid" })
  species_id!: string;

  @ManyToOne(() => Species)
  @JoinColumn({ name: "species_id" })
  species!: Species;

  @Column()
  title!: string;

  @Column()
  breed!: string;

  @Column({ type: "enum", enum: PetGender, enumName: "pet_gender_enum", default: PetGender.UNKNOWN })
  gender!: PetGender;

  @Column({ type: "date" })
  birth_date!: string;

  @Column({ default: false })
  vaccinated!: boolean;

  @Column({ type: "enum", enum: ListingType, enumName: "listing_type_enum" })
  listing_type!: ListingType;

  @Column({ default: false })
  is_rescue!: boolean;

  @Column()
  district!: string;

  @Column()
  area!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: "enum", enum: PetStatus, enumName: "pet_status_enum", default: PetStatus.PENDING_REVIEW })
  status!: PetStatus;

  @Column({ nullable: true })
  photo_path?: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
