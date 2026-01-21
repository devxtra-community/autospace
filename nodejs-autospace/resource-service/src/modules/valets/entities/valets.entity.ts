import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ValetStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
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
    enum: ValetStatus,
    default: ValetStatus.PENDING,
  })
  status!: ValetStatus;

  @Column({ type: "boolean", default: true })
  availabilityStatus!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
