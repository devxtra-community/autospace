import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("garage_reviews")
@Index(["garageId"])
@Index(["userId"])
@Index(["bookingId"], { unique: true })
export class GarageReview {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "garage_id",
    type: "uuid",
  })
  garageId!: string;

  @Column({
    name: "user_id",
    type: "uuid",
  })
  userId!: string;

  @Column({
    name: "booking_id",
    type: "uuid",
    unique: true,
  })
  bookingId!: string;

  @Column({
    type: "int",
  })
  rating!: number;

  @Column({
    type: "text",
    nullable: true,
    default: null,
  })
  comment!: string | null;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;
}
