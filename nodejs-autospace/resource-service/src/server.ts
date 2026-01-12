import "reflect-metadata";

import "dotenv/config";
import { app } from "./app";
import { AppDataSource } from "./db/data-source";

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const PORT = process.env.PORT || 4002;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

start();
