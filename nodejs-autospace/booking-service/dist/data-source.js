import "reflect-metadata";
import { DataSource } from "typeorm";
import { Booking } from "./entities/booking.entity.js";
import "dotenv/config";
import { Payment } from "./entities/payment.entity.js";
import { GarageReview } from "./entities/garage-review.entity.js";
// console.log("url", process.env.DATABASE_URL);
export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    // schema: "booking_db",
    synchronize: false,
    entities: [Booking, Payment, GarageReview],
});
setInterval(async () => {
    await AppDataSource.query("SELECT 1");
}, 300000);
//# sourceMappingURL=data-source.js.map