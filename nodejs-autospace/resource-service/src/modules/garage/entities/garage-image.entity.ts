import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("garage_images")
export class GarageImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "garage_id", type: "uuid" })
  garageId!: string;

  @Column({ name: "file_id", type: "uuid" })
  fileId!: string;

  @Column({ type: "int", default: 0 })
  position!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
