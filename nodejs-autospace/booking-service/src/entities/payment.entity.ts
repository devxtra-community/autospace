import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "booking_id", type: "uuid" })
  bookingId!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  // DB is INTEGER → use int here
  @Column({ type: "int" })
  amount!: number;

  @Column({ type: "varchar", length: 10, default: "INR" })
  currency!: string;

  // DB is varchar, NOT enum
  @Column({ type: "varchar", length: 20, default: "PENDING" })
  status!: PaymentStatus;

  @Column({ name: "stripe_payment_intent_id", type: "varchar", nullable: true })
  stripePaymentIntentId!: string | null;

  @Column({ name: "stripe_charge_id", type: "varchar", nullable: true })
  stripeChargeId!: string | null;

  @Column({ name: "failure_reason", type: "varchar", nullable: true })
  failureReason!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
