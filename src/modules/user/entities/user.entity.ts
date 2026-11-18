import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "@/common/enums/role.enum";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "enum", enum: Role, default: Role.CUSTOMER })
  role!: Role;

  @Column({ default: true })
  is_active!: boolean;

  @Column()
  created_at?: Date;

  @Column()
  updated_at?: Date;
}
