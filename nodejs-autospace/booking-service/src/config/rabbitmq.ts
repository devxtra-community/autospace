import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbit = async () => {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error("RABBITMQ_URL is not defined");
  }

  let retries = 5;

  while (retries) {
    try {
      const connection = await amqp.connect(url);

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      connection.on("close", () => {
        console.error("RabbitMQ connection closed");
      });

      channel = await connection.createChannel();

      await channel.assertExchange("autospace", "topic", {
        durable: true,
      });

      console.log("RabbitMQ connected");
      return;
    } catch (err) {
      console.error("RabbitMQ connection failed, retrying...", err);
      retries--;

      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  throw new Error(" Could not connect to RabbitMQ after retries");
};

export const publishEvent = async (routingKey: string, data: unknown) => {
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.publish("autospace", routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
