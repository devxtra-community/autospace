console.log("CWD =", process.cwd());
console.log("__dirname =", __dirname);

import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.prod"
    : process.env.NODE_ENV === "stage"
      ? ".env.stage"
      : ".env";

dotenv.config({
  path: path.resolve(__dirname, `../../${envFile}`),
});

export const env = {
  PORT: process.env.PORT || 4002,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
};
