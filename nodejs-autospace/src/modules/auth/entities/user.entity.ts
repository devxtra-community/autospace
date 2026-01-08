import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

import { UserRole, UserStatus } from "../constants";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  fullname!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Column({ type: "varchar", length: 255 })
  password_hash!: string;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role!: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
  })
  status!: UserStatus;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
