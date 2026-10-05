import { channel } from "../rabbitmq/connection.js";
import paymentRepository from "../database/payment.repository.js";

await channel.assertExchange("payments", "direct");
await channel.assertQueue("payments.process", {
  durable: true,
});
await channel.bindQueue("payments.process", "payments", "payment.process");

await channel.assertExchange("payments.dlq", "direct");
await channel.assertQueue("payments.dlq", {
  durable: true,
});
await channel.bindQueue("payments.dlq", "payments.dlq", "payment.dlq");

channel.prefetch(1);

await channel.consume("payments.process", async (message) => {
  if (!message) return;

  const retryCount = message.properties.headers?.["x-retry-count"] ?? 0;
  const messageObject = JSON.parse(message.content.toString());

  try {
    await paymentRepository.processPayment(messageObject);

    channel.ack(message);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      channel.ack(message);
    } else if (retryCount < 3) {
      channel.publish("payments", "payment.process", message.content, {
        headers: {
          "x-retry-count": retryCount + 1,
        },
      });

      await channel.waitForConfirms();

      channel.ack(message);
    } else {
      channel.publish("payments.dlq", "payment.dlq", message.content);
      await channel.waitForConfirms();
      channel.ack(message);
    }
  }
});
