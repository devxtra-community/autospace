"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startValetConsumer = exports.publishEvent = exports.initRabbit = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const valet_service_1 = require("../modules/valets/services/valet.service");
let channel;
const initRabbit = async () => {
    if (!process.env.RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is not defined");
    }
    const conn = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange("autospace", "topic", {
        durable: true,
    });
    console.log("RabbitMQ connected (resource-service)");
};
exports.initRabbit = initRabbit;
const publishEvent = async (routingKey, data) => {
    if (!channel) {
        throw new Error("RabbitMQ not initialized");
    }
    channel.publish("autospace", routingKey, Buffer.from(JSON.stringify(data)));
    console.log("Event published:", routingKey, data);
};
exports.publishEvent = publishEvent;
const startValetConsumer = async () => {
    if (!channel) {
        throw new Error("RabbitMQ not initialized");
    }
    const q = await channel.assertQueue("resource.valet.requested.queue", {
        durable: true,
    });
    await channel.bindQueue(q.queue, "autospace", "valet.requested");
    console.log("Waiting for valet.requested...");
    channel.consume(q.queue, async (msg) => {
        if (!msg)
            return;
        try {
            const data = JSON.parse(msg.content.toString());
            console.log("Valet requested:", data);
            await (0, valet_service_1.assignValetToBooking)(data.bookingId, data.garageId);
            channel.ack(msg);
        }
        catch (error) {
            console.error("Error processing valet.requested:", error);
        }
    });
};
exports.startValetConsumer = startValetConsumer;
