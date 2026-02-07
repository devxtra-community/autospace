import "reflect-metadata";
import { DataSource } from "typeorm";
import { Booking } from "./models/booking.model.js";
import "dotenv/config";

console.log("url", process.env.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
  // schema: "booking_db",
  synchronize: true,
  entities: [Booking],
});

setInterval(async () => {
  await AppDataSource.query("SELECT 1");
}, 300000);
