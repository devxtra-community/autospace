import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Garage } from "../../garage/entities/garage.entity";

@Entity("slots")
@Unique(["garageId", "date", "startTime", "endTime"])
export class Slot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  garageId!: string;

  @ManyToOne(() => Garage, { onDelete: "CASCADE" })
  @JoinColumn({ name: "garageId" })
  garage!: Garage;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "time" })
  startTime!: string;

  @Column({ type: "time" })
  endTime!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "boolean", default: false })
  isBooked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
