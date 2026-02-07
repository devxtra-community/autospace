import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 4004;

const startServer = async () => {
  try {
    // await AppDataSource.initialize();
    // await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Booking service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
