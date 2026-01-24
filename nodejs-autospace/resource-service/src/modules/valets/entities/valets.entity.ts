import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ValetEmployementStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum ValetAvailabilityStatus {
  AVAILABLE = "AVAILABLE", // Ready to take jobs
  BUSY = "BUSY", // Currently assigned to a booking/job
  OFF_DUTY = "OFF_DUTY", // Not working (break, end of shift)
  OFFLINE = "OFFLINE", // Not logged in
}

@Entity("valets")
export class Valet {
  @PrimaryColumn("uuid")
  id!: string;

  

  @Column({ type: "uuid" })
  companyId!: string;

  @Column({ type: "uuid" })
  garageId!: string;

  @Column({
    type: "enum",
    enum: ValetEmployementStatus,
    default: ValetEmployementStatus.PENDING,
  })
  employmentStatus!: ValetEmployementStatus;

  @Column({
    type: "enum",
    enum: ValetAvailabilityStatus,
    default: ValetAvailabilityStatus.OFFLINE,
  })
  availabilityStatus!: ValetAvailabilityStatus;

  // Optional: Track current booking they're working on
  @Column({ type: "uuid", nullable: true })
  currentBookingId!: string | null;

  @Column({ type: "uuid", nullable: true })
  approvedBy!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
