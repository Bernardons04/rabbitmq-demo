import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "rabbitmq-demo",
  password: "rabbitmq-demo",
  database: "rabbitmq-demo",
});
