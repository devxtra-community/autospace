import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { FileEntity } from "../../files/files.entity";

@Entity("garage_images")
export class GarageImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "garage_id", type: "uuid" })
  garageId!: string;

  @Column({ name: "file_id", type: "uuid" })
  fileId!: string;

  @ManyToOne(() => FileEntity, { eager: true })
  @JoinColumn({ name: "file_id" })
  file!: FileEntity;

  @Column({ type: "int", default: 0 })
  position!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
