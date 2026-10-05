import amqp from "amqplib";

const connection = await amqp.connect("amqp://localhost:5672");

export const channel = await connection.createConfirmChannel();