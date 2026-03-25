import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import { Garage } from "./garage.entity";
import { GarageSlot } from "./garage-slot.entity";

@Entity("garage_floors")
export class GarageFloor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "garage_id" })
  garageId!: string;

  @ManyToOne(() => Garage, (garage) => garage.floors, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "garage_id" })
  garage!: Garage;

  @Column({ type: "int", name: "floor_number" })
  floorNumber!: number;

  @OneToMany(() => GarageSlot, (slot) => slot.floor)
  slots!: GarageSlot[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
