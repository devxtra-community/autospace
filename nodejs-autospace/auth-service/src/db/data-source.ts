import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../modules/auth/entities/user.entity";
import { RefreshToken } from "../modules/auth/entities/refreshtoken.entity";
import { PasswordResetToken } from "../modules/auth/entities/password-reset-token.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  synchronize: false,
  logging: false,
  entities: [User, RefreshToken, PasswordResetToken],
});
