# RabbitMQ Payment Processing Demo

A study project built to explore reliable asynchronous payment processing using Node.js, TypeScript, RabbitMQ and PostgreSQL.

## Architecture

```text
Client
  ↓
HTTP API
  ↓
RabbitMQ Exchange
  ↓
payments.process
  ↓
Worker
  ↓
PostgreSQL
```

Failed messages are retried and eventually sent to a Dead Letter Queue (DLQ).

## Features

- RabbitMQ direct exchange
- Manual message acknowledgements
- Publisher Confirms
- Prefetch
- Competing consumers
- Transactional payment processing
- Idempotency using a unique `messageId`
- Retry mechanism with a maximum of 3 retries
- Dead Letter Queue (DLQ)
- PostgreSQL persistence
- Docker Compose

## Message Flow

1. The API receives a payment.
2. A unique `messageId` is generated.
3. The payment is published to RabbitMQ.
4. A worker consumes the message.
5. The payment is processed inside a PostgreSQL transaction.
6. The message is acknowledged after successful processing.
7. Failed messages are republished with an incremented retry counter.
8. After the retry limit is reached, the message is published to the DLQ.

## Reliability

The project explores several mechanisms used in reliable message processing:

- **Manual ACKs** prevent messages from being considered successfully processed before the worker finishes.
- **Publisher Confirms** ensure retry/DLQ publications are confirmed by RabbitMQ before acknowledging the original message.
- **Database transactions** prevent partially processed payments.
- **Idempotency** prevents duplicate `messageId` values from being processed multiple times.
- **Prefetch** controls how many unacknowledged messages can be delivered to a worker.

## Running Locally

### Requirements

- Node.js
- Docker
- Docker Compose

### Start infrastructure

```bash
docker compose up -d
```

### Install dependencies

```bash
npm install
```

### Start the API

```bash
npm run api
```

### Start a worker

In another terminal:

```bash
npm run worker
```

Multiple workers can be started to simulate competing consumers.

## RabbitMQ Management

The RabbitMQ Management UI is available at:

`http://127.0.0.1:15672`

Default credentials:

```text
Username: guest
Password: guest
```

## API

### Create payment

```http
POST /payments
Content-Type: application/json
```

Example:

```json
{
  "amount": 1000
}
```

Response:

```text
202 Payment accepted
```

## Tech Stack

- Node.js
- TypeScript
- RabbitMQ
- PostgreSQL
- Docker
- `amqplib`
- `pg`
