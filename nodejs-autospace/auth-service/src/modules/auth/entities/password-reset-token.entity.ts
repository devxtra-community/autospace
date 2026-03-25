import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "user_id" })
  userId!: string;

  @Column({ type: "text", unique: true })
  token!: string;

  @Column({ type: "timestamp", name: "expires_at" })
  expiresAt!: Date;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;
}
