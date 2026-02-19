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

  @Column({ name: "company_id", type: "uuid" })
  companyId!: string;

  @Column({ name: "garage_id", type: "uuid" })
  garageId!: string;

  @Column({
    name: "employment_status",
    type: "enum",
    enum: ValetEmployementStatus,
    default: ValetEmployementStatus.PENDING,
  })
  employmentStatus!: ValetEmployementStatus;

  @Column({
    name: "availability_status",
    type: "enum",
    enum: ValetAvailabilityStatus,
    default: ValetAvailabilityStatus.OFFLINE,
  })
  availabilityStatus!: ValetAvailabilityStatus;

  @Column({ name: "current_booking_id", type: "uuid", nullable: true })
  currentBookingId!: string | null;

  @Column({ name: "approved_by", type: "uuid", nullable: true })
  approvedBy!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
