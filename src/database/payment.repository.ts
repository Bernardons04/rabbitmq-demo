import { pool } from "../database/connection.js";

type Payment = {
  messageId: string;
  amount: number;
};

async function processPayment({ messageId, amount }: Payment) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query({
      text: `
        INSERT INTO payments (message_id, amount)
        VALUES ($1, $2);
      `,
      values: [messageId, amount],
    });

    await client.query({
      text: `
        UPDATE payments
        SET processed_at = NOW()
        WHERE message_id = $1;
      `,
      values: [messageId],
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const paymentRepository = {
  processPayment,
};

export default paymentRepository;
