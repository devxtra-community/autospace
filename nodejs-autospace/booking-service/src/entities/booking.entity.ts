import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum BookingValetStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  ASSIGNED = "ASSIGNED",
  COMPLETED = "COMPLETED",
}

@Entity({ name: "booking" })
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  garageId!: string;

  @Column("uuid")
  slotId!: string;

  @Column("timestamp")
  startTime!: Date;

  @Column("timestamp")
  endTime!: Date;

  @Column("varchar", { default: "pending", length: 50 })
  status!: string;

  @Column({ name: "valet_requested", type: "boolean", default: false })
  valetRequested!: boolean;

  @Column({
    name: "valet_status",
    type: "enum",
    enum: BookingValetStatus,
    default: BookingValetStatus.NONE,
  })
  valetStatus!: BookingValetStatus;

  @Column({ name: "valet_id", type: "uuid", nullable: true })
  valetId!: string | null;

  @Column({ name: "current_valet_request_id", type: "uuid", nullable: true })
  currentValetRequestId!: string | null;

  @Column({ name: "rejected_valet_ids", type: "json", nullable: true })
  rejectedValetIds!: string[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
