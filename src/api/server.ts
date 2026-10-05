import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { channel } from "../rabbitmq/connection.js";

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/payments") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const paymentData = {
        ...JSON.parse(body),
        messageId: randomUUID(),
      };

      channel.publish(
        "payments",
        "payment.process",
        Buffer.from(JSON.stringify(paymentData)),
        {
          headers: {
            "x-retry-count": 0,
          },
        },
      );

      // processar pagamento
      res.statusCode = 202;
      res.end("Payment accepted");
    });

    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(3000);
