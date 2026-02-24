import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbit = async () => {
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();

  await channel.assertExchange("autospace", "topic", {
    durable: true,
  });

  console.log("RabbitMQ connected");
};

export const publishEvent = async (routingKey: string, data: unknown) => {
  channel.publish("autospace", routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
