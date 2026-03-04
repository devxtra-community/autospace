import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log("Connected to DB.");

    await AppDataSource.query(
      `ALTER TABLE garages ADD COLUMN IF NOT EXISTS "valetServiceRadius" int DEFAULT 20;`,
    );
    console.log("Column added.");
  } catch (err) {
    console.error(err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
