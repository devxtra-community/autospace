import "dotenv/config";

import app from "./app";
import { AppDataSource } from "./db/data-source";

const startServer = async () => {
  try {
    //  TypeORM connection
    await AppDataSource.initialize();
    console.log("Database connected");

    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();
