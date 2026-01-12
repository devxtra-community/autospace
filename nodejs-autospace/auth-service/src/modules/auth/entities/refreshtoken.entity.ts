import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  token_hash!: string;

  @Column({ type: "timestamptz" })
  expires_at!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
