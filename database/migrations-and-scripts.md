# Migrations and Scripts

> Database script reference for the Support Ticket Management System.

---

## Scripts (Planned)

| Script | Location | Command | Purpose |
|--------|----------|---------|---------|
| Seed | `server/src/scripts/seed.js` | `npm run seed` | Insert demo data |
| Dev server | `server/src/index.js` | `npm run dev` | Connect DB + start API |

---

## Seed Script

### Execution

```bash
cd server
npm run seed
```

### Behaviour

1. Connect to `MONGODB_URI`
2. Drop all documents in `users`, `tickets`, `comments` (development)
3. Insert 4 users (see [seed-data/users.md](./seed-data/users.md))
4. Insert 8 tickets (see [seed-data/tickets.md](./seed-data/tickets.md))
5. Insert 6 comments (see [seed-data/comments.md](./seed-data/comments.md))
6. Log counts and disconnect

### Idempotency

Development: destructive re-seed (drop + insert). Safe to run multiple times.

### Environment

Requires `MONGODB_URI` in `server/.env`. See [setup-notes.md](./setup-notes.md).

---

## Index Sync

In development, Mongoose `syncIndexes()` runs on server startup to ensure schema indexes exist.

Manual verification:

```bash
mongosh ticket-management --eval "db.tickets.getIndexes()"
```

---

## Migration Strategy

No formal migration framework for assessment scope.

| Change | Action |
|--------|--------|
| New field with default | Update Mongoose schema |
| New index | `syncIndexes()` on startup |
| Breaking change | Drop database + re-seed |

See [setup-notes.md](./setup-notes.md#migration-strategy) for full details.

---

## Test Setup

Integration tests use `tests/helpers/testSetup.js` (planned):
- Connect to `ticket-management-test`
- Drop collections in `beforeAll`
- Insert minimal seed (2 users, 3 tickets, 1 comment)
- Drop collections in `afterAll`

**Never point tests at the development database.**

---

## Related

- [setup-notes.md](./setup-notes.md)
- [seed-data/README.md](./seed-data/README.md)
- [schema/README.md](./schema/README.md)
