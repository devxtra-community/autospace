"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Database connected');
    }
    catch (error) {
        console.error('Database connection failed', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = pool;
