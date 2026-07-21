
# Pulse Monitor API

## :beginner: Overview 

Pulse-monitor is a RESTful uptime monitoring service built with **Node.js**, **Express**, and **PostgreSQL**.

Pulse continuously monitors websites by polling them at configurable intervals, records every check as time-series data, tracks incidents automatically, and exposes a public status page.

---

## :sparkles: Features

- JWT Authentication
- User-owned monitors
- Create, update and delete monitors
- Automatic background scheduler
- Timeout detection using `AbortSignal.timeout()`
- Time-series monitoring checks
- Automatic incident management
- CSV export of checks
- Uptime reporting
- Public status page
- OpenAPI documentation
- PostgreSQL transactions
- Zod validation
- node:test test suite using `node:test`

---

## :toolbox: Tech Stack

- Node.js
- Express
- PostgreSQL
- pg
- OpenAPI / Swagger UI
- Zod
- JSON Web Token
- Swagger UI
- node:test

---

## Project Structure

```
Pulse-Monitor-API
│
├── db
│   ├── schemas.sql
│   └── seed.sql
│
├── docs
│   └── openapi.yaml
|── lib
    |── logger.js
    |── jwt.js
    |── password.js
│
├── scripts
│   ├── reset-db.js
│   ├── migrate.js
│   └── seed.js
│
├── src
│   ├── controllers
│   ├── db
│   ├── middleware
│   ├── models
│   ├── routes
    |── schedular
    |── validations
│   ├── services
│   ├── app.js
    |── config.js
│   └── server.js
│
├── test
│   └── pulse-test.js
│
├── package.json
|── render.yaml
└── README.md
```

---

## Database Schema

The project contains three main tables.

- monitors
- checks
- incidents

Each monitor belongs to one authenticated user.

Each check belongs to a monitor.

Each incident belongs to a monitor.

---

---

## :electric_plug: Installation

### 1. Clone the repository.

```bash
git clone https://github.com/AsohLove/Pulse-Monitor.git

cd Pulse-Monitor
```

### 2. Install dependencies.

```bash
npm install
```

### 3. Create a PostgreSQL database

Example:

```sql
CREATE DATABASE pulse;
CREATE DATABASE pulse_test;
```

### 4. Configure Environment Variables

Create a `.env` file.

```env
PORT=3000

DATABASE_URL=postgres://username:password@localhost:5432/pulse

JWT_SECRET=your-secret

LOG_LEVEL=info

POLL_TIMEOUT_MS=5000
```

Create a `.env.test` file.

```env
PORT=3001

DATABASE_URL=postgres://postgres:password@localhost:5432/pulse_test

JWT_SECRET=your_secret_key

NODE_ENV=test
```
---

### 5. Run migrations.

```bash
npm run migrate
```

### 6. Seed the database (optional).

```bash
npm run seed
```

---

### 7. Run the application

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## Running Tests

Run the complete test suite.

```bash
npm test
```
![Successful test run snapshot](./Pulse-Test.png)

---

## Scheduler Design

Pulse uses an **in-process scheduler**.

Every scheduler tick:

1. Loads all active monitors.
2. Checks whether each monitor is due for polling.
3. Polls due monitors using `fetch()` together with `AbortSignal.timeout()`.
4. Records the result as a monitoring check.
5. Opens an incident when a monitor changes from **UP → DOWN**.
6. Resolves the incident when the monitor changes from **DOWN → UP**.

Each incident update is wrapped inside a PostgreSQL transaction to guarantee consistency.

### Limitation

The scheduler is intentionally implemented as an **in-process loop**.

If multiple application instances are deployed simultaneously, each instance would poll the same monitors. Coordinating distributed schedulers is outside the scope of this project.

---

## API Documentation

Swagger UI documentation is available at

```
/docs
```
![OpenAPI documentation](./OpenAPI.png)

---

## Health Check

```
GET /health
```

Returns

```json
{
  "status": "OK"
}
```

---

## Main Endpoints

---
## Authentication

Protected endpoints require a JWT.

1. Register a user

```
POST /auth/register
```

2. Login

```
POST /auth/login
```

3. Copy the returned JWT.

4. Click the **Authorize** button inside Swagger UI.

5. Paste

```
Bearer <JWT>
```

You can now access protected endpoints.

---

### Monitors

```
GET /monitors
POST /monitors
GET /monitors/:id
PATCH /monitors/:id
DELETE /monitors/:id
```

### Checks

```
GET /monitors/:id/checks
GET /monitors/:id/checks.csv
GET /monitors/:id/uptime
```

### Incidents

```
GET /incidents
GET /monitors/:id/incidents
```

### Public Status

```
GET /status
```

---

Common status codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 409  | Conflict              |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## Deployment

Production deployment is hosted on Render and the database is saved on **Neon**

Required environment variables:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
LOG_LEVEL=
```

---

- GitHub: [@loveasoh](https://github.com/AsohLove)
- Twitter: [@loveasoh](https://x.com/LoveTheModifier)
- LinkedIn: [@love asoh](https://www.linkedin.com/in/asohlove/)

:earth_africa: Based in Cameroon | Open for hybrid opportunities


## :lock: License
This project is [MIT](./LICENSE) licensed.
