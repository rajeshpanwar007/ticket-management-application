# Server

Express API for the Support Ticket Management System.

## Setup

```bash
cd server
cp .env.example .env
npm install
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## Seed

```bash
npm run seed
```

## Structure

```
server/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app (importable for tests)
│   ├── config/               # Environment and database
│   ├── constants/            # Shared enums
│   ├── controllers/          # HTTP request handlers
│   ├── domain/               # Pure business rules (state machine)
│   ├── middleware/           # Cross-cutting concerns
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Route definitions
│   ├── services/             # Business logic (TODO)
│   ├── utils/                # ApiError, asyncHandler
│   ├── validators/           # express-validator chains
│   └── scripts/              # Seed script
└── tests/
    ├── unit/
    └── integration/
```

## API

Base URL: `http://localhost:5000/api`

See [`../api-contract.md`](../api-contract.md) for full endpoint documentation.
