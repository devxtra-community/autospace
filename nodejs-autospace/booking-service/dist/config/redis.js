import { createClient } from "redis";
import { logger } from "../utils/logger.js";
const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => {
    logger.error("Redis client error", { message: err.message });
});
redisClient.on("connect", () => {
    logger.info("Redis connected");
});
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};
export default redisClient;
//# sourceMappingURL=redis.js.map