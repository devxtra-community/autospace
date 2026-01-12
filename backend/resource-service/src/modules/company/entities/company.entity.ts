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
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column("uuid")
  ownerUserId!: string;

  @Column({ length: 150 })
  companyName!: string;

  @Index({ unique: true })
  @Column({ length: 100 })
  businessRegistrationNumber!: string;

  @Column({ length: 200 })
  businessLocation!: string;

  @Column({ length: 150 })
  contactEmail!: string;

  @Column({ length: 20 })
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
