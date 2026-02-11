import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { GarageFloor } from "./garage-floor.entity";

export enum SlotSize {
  STANDARD = "STANDARD",
  LARGE = "LARGE",
}

@Entity("garage_slots")
@Unique(["floorId", "slotNumber"])
export class GarageSlot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "floor_id" })
  floorId!: string;

  @ManyToOne(() => GarageFloor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "floor_id" })
  floor!: GarageFloor;

  @Column({ type: "varchar", length: 10, name: "slot_number" })
  slotNumber!: string;

  @Column({
    type: "enum",
    enum: SlotSize,
    default: SlotSize.STANDARD,
    name: "slot_size",
  })
  slotSize!: SlotSize;

  @Column({ type: "numeric", precision: 10, scale: 2, name: "price_per_hour" })
  pricePerHour!: number;

  @Column({
    type: "enum",
    enum: ["AVAILABLE", "RESERVED", "OCCUPIED"],
    default: "AVAILABLE",
  })
  status!: "AVAILABLE" | "RESERVED" | "OCCUPIED";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
