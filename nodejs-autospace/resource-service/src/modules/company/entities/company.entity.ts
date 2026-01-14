import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum CompanyStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REJECTED = "rejected",
}
@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column("uuid")
  ownerUserId!: string;

  @Column({ type: "varchar", length: 150 })
  companyName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  businessRegistrationNumber!: string;

  @Column({ type: "varchar", length: 200 })
  businessLocation!: string;

  @Column({ type: "varchar", length: 150 })
  contactEmail!: string;

  @Column({ type: "varchar", length: 20 })
  contactPhone!: string;

  @Column({
    type: "enum",
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  status!: CompanyStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
