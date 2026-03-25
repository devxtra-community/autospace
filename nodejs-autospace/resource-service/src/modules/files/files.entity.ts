import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("files")
export class FileEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  key!: string;

  @Column({ type: "text" })
  mimeType!: string;

  @Column({ type: "int" })
  size!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
