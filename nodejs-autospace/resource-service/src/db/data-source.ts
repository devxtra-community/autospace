import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,
  logging: true,
  entities: [__dirname + "/../modules/**/*.entity.{ts,js}"],
});

setInterval(async () => {
  await AppDataSource.query("SELECT 1");
}, 300000);
