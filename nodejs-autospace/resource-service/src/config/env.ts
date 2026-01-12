import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4002,
  DATABASE_URL: process.env.DATABASE_URL!,
};
