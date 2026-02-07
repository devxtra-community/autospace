import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
