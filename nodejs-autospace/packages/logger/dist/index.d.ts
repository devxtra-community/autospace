import winston from 'winston';
import 'winston-daily-rotate-file';
export declare const createLogger: ({ service }: {
    service: string;
}) => winston.Logger;
export declare const createHttpLogger: ({ service }: {
    service: string;
}) => (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse<import("node:http").IncomingMessage>, callback: (err?: Error) => void) => void;
