// entities/garage-floor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Garage } from "./garage.entity";

@Entity("garage_floors")
export class GarageFloor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "garage_id" })
  garageId!: string;

  @ManyToOne(() => Garage, { onDelete: "CASCADE" })
  @JoinColumn({ name: "garage_id" })
  garage!: Garage;

  @Column({ type: "int", name: "floor_number" })
  floorNumber!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
