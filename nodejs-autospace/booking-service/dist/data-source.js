import { DataSource } from "typeorm";
import { Booking } from "./models/booking.model.js";
import 'dotenv/config';
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "booking_db",
    synchronize: true,
    logging: false,
    entities: [Booking],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map