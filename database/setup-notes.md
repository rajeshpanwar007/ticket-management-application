# Database Setup Notes

> Step-by-step guide to configure MongoDB for local development, testing, and assessment demo.

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| MongoDB | 6.0+ | 7.x recommended |
| Node.js | 20 LTS | For Mongoose and seed script |
| npm | 9+ | Package management |

---

## Option A: Local MongoDB

### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu)

```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Windows

Download and install from [MongoDB Community Download](https://www.mongodb.com/try/download/community). Run as a Windows service.

### Verify Local Installation

```bash
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

Expected: `{ ok: 1 }` with connection status.

---

## Option B: MongoDB Atlas (Cloud)

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with **read/write** access to `ticket-management` only
3. Add your IP to the network access whitelist (or `0.0.0.0/0` for development only)
4. Copy the connection string from **Connect → Drivers**
5. Replace `<password>` and set database name to `ticket-management`

---

## Environment Configuration

### Server `.env` File

Create `server/.env` (never commit this file):

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ticket-management

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173

# Auth (stretch only)
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=24h
```

### `.env.example` (commit this)

```env
MONGODB_URI=mongodb://localhost:27017/ticket-management
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=24h
```

### Test Environment

For integration tests, use a separate database to avoid destroying dev seed data:

```env
# server/.env.test (or set in test setup)
MONGODB_URI=mongodb://localhost:27017/ticket-management-test
NODE_ENV=test
```

---

## Environment Variables Reference

| Variable | Required | Default | Used By |
|----------|----------|---------|---------|
| `MONGODB_URI` | yes | — | Mongoose connection |
| `MONGODB_DB_NAME` | no | derived from URI | Override database name |
| `PORT` | no | `5000` | Express server |
| `NODE_ENV` | no | `development` | Index sync, logging |
| `CLIENT_URL` | no | `http://localhost:5173` | CORS origin |
| `JWT_SECRET` | stretch | — | JWT signing |
| `JWT_EXPIRES_IN` | stretch | `24h` | Token expiry |

### Connection String Format

```
mongodb://[username:password@]host[:port]/database[?options]
```

| Component | Example |
|-----------|---------|
| Local, no auth | `mongodb://localhost:27017/ticket-management` |
| Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/ticket-management?retryWrites=true&w=majority` |
| Test DB | `mongodb://localhost:27017/ticket-management-test` |

---

## Database Initialization

### First-Time Setup Sequence

```
1. Install and start MongoDB
2. Copy server/.env.example → server/.env
3. Set MONGODB_URI
4. cd server && npm install
5. npm run seed          ← creates collections, indexes, and demo data
6. npm run dev           ← starts API; Mongoose connects on boot
```

### Verify Data After Seed

```bash
mongosh ticket-management --eval "db.users.countDocuments()"
mongosh ticket-management --eval "db.tickets.countDocuments()"
mongosh ticket-management --eval "db.comments.countDocuments()"
```

Expected counts: 4 users, 8 tickets, 6 comments.

---

## Index Management

### Development

Mongoose `syncIndexes()` runs on server startup in development mode. This ensures indexes defined in schemas are created without a separate migration step.

### Manual Index Verification

```bash
mongosh ticket-management --eval "db.tickets.getIndexes()"
mongosh ticket-management --eval "db.users.getIndexes()"
mongosh ticket-management --eval "db.comments.getIndexes()"
```

### Expected Indexes

| Collection | Indexes |
|------------|---------|
| users | `_id`, `email` (unique), `role` |
| tickets | `_id`, `status`, `createdBy`, `assignedTo` (sparse), text on title+description, `createdAt` |
| comments | `_id`, `ticketId + createdAt` (compound) |

---

## Migration Strategy

### Assessment Scope (No Migration Framework)

| Change Type | Action |
|-------------|--------|
| New field with default | Update Mongoose schema; existing docs use default on read |
| New index | `syncIndexes()` on startup or manual `createIndex` |
| Enum value added | Update schema enum + service validation |
| Breaking change | Drop collection in dev; re-run seed |
| Production (future) | Adopt `migrate-mongo` or equivalent |

### Schema Change Workflow

```
1. Update Mongoose model in server/src/models/
2. Update database/schema/{collection}.md
3. Update data-model.md if relationships change
4. Drop affected collection in dev (if breaking)
5. Re-run seed script
6. Update integration tests
```

### Rollback (Development)

```bash
mongosh ticket-management --eval "db.dropDatabase()"
npm run seed
```

---

## Test Database Setup

Integration tests must use an isolated database.

### Configuration

| Setting | Value |
|---------|-------|
| Database name | `ticket-management-test` |
| URI | `mongodb://localhost:27017/ticket-management-test` |
| Lifecycle | Created and dropped per test suite run |

### Test Lifecycle

```
beforeAll:
  1. Connect to ticket-management-test
  2. Drop all collections
  3. Insert minimal seed data (2 users, 3 tickets)

afterAll:
  1. Drop all collections
  2. Disconnect
```

**Never run tests against the development database.**

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB not running | Start mongod service |
| `Authentication failed` | Wrong Atlas credentials | Verify user/password in URI |
| `E11000 duplicate key` on email | Re-seeding without clearing | Drop database and re-seed |
| Text search returns nothing | Text index not created | Run `syncIndexes()` or restart server |
| Tests pollute dev data | Wrong MONGODB_URI in tests | Use separate test URI |
| `MongoServerError: bad auth` | Special chars in password | URL-encode password in connection string |

---

## Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` contains placeholder values only
- [ ] No real credentials in documentation or seed files
- [ ] Atlas IP whitelist restricted (not `0.0.0.0/0` in production)
- [ ] Database user has minimum required permissions
- [ ] Demo passwords documented in README are clearly marked as dev-only

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [`schema/`](./schema/) | Per-collection field and index definitions |
| [`seed-data/`](./seed-data/) | Seed record specifications |
| [`../data-model.md`](../data-model.md) | Full data model overview |
| [`migrations-and-scripts.md`](./migrations-and-scripts.md) | Script execution reference |
