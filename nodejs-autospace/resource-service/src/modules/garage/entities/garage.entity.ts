import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum GarageStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REJECTED = "rejected",
}

@Entity("garages")
export class Garage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column("uuid")
  companyId!: string;

  @Column({ type: "uuid", nullable: true })
  managerId!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  garageRegistrationNumber!: string | null;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({
    type: "varchar",
    name: "contact_email",
    length: 150,
    nullable: true,
  })
  contactEmail!: string | null;

  @Column({
    type: "varchar",
    name: "contact_phone",
    length: 20,
    nullable: true,
  })
  contactPhone!: string | null;

  @Column({ type: "varchar", length: 255 })
  locationName!: string;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: "int" })
  capacity!: number;

  @Column({ type: "boolean", default: false })
  valetAvailable!: boolean;

  @Column({
    type: "enum",
    enum: GarageStatus,
    default: GarageStatus.PENDING,
  })
  status!: GarageStatus;

  @Index()
  @Column("uuid")
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
