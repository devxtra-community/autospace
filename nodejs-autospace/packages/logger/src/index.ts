import winston from "winston";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import "winston-daily-rotate-file";

export const createLogger = ({ service }: { service: string }) => {
  const isProd = process.env.NODE_ENV === "production";

  const logDir = isProd
    ? `/var/log/autospace/${service}`
    : path.join(process.cwd(), "logs", service);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),

      new winston.transports.DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        level: "error",
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
      }),

      new winston.transports.DailyRotateFile({
        filename: `${logDir}/combined-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
      }),
    ],
  });
};

export const createHttpLogger = ({ service }: { service: string }) => {
  const logger = createLogger({ service });

  return morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  });
};
