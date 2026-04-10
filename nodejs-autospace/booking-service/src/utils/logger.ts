import { createLogger } from "@autospace/logger";

export const logger: ReturnType<typeof createLogger> = createLogger({
  service: "booking-service",
});
