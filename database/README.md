# Database Documentation

> MongoDB setup, schema, and seed data for the Support Ticket Management System.

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [setup-notes.md](./setup-notes.md) | Installation, env vars, connection, troubleshooting |
| [schema/](./schema/) | Per-collection field, index, and validation specs |
| [seed-data/](./seed-data/) | Demo and test seed record definitions |
| [migrations-and-scripts.md](./migrations-and-scripts.md) | Script execution reference |
| [../data-model.md](../data-model.md) | Full data model overview |

---

## Quick Reference

| Item | Value |
|------|-------|
| ODM | Mongoose 8.x |
| Dev database | `ticket-management` |
| Test database | `ticket-management-test` |
| Collections | `users`, `tickets`, `comments` |
| Seed counts | 4 users · 8 tickets · 6 comments |

---

## Setup Sequence

```
1. Install MongoDB (local or Atlas)
2. Copy server/.env.example → server/.env
3. Set MONGODB_URI
4. cd server && npm run seed
5. Verify counts (see seed-data/README.md)
6. npm run dev
```

See [setup-notes.md](./setup-notes.md) for full instructions.

---

## Schema Overview

```
users ──< tickets.createdBy
users ──< tickets.assignedTo
users ──< comments.authorId
tickets ──< comments.ticketId
```

See [schema/README.md](./schema/README.md) for collection details.

---

## Seed Overview

| Collection | Records | File |
|------------|---------|------|
| users | 4 (one per role) | [seed-data/users.md](./seed-data/users.md) |
| tickets | 8 (all statuses covered) | [seed-data/tickets.md](./seed-data/tickets.md) |
| comments | 6 (4 tickets) | [seed-data/comments.md](./seed-data/comments.md) |

See [seed-data/README.md](./seed-data/README.md) for execution and verification.
