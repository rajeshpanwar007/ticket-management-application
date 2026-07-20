# Seed Data

> Specification for demo and test seed data.
> Implementation: `server/src/scripts/seed.js` (to be created).

---

## Goals

| Goal | How Seed Supports It |
|------|---------------------|
| Demo all ticket statuses | One ticket per status + extras |
| Test search (AC-8) | Tickets with distinctive title keywords |
| Test state machine (AC-7) | Tickets in `open` and `in_progress` ready for transitions |
| Test comments (AC-6) | 6 comments across 4 tickets |
| Test RBAC (stretch) | One user per role |
| Assessable in under 15 min | Fixed credentials documented in README |

---

## Seed Execution

### Command (planned)

```bash
cd server
npm run seed
```

### Order of Operations

```
1. Connect to MongoDB (MONGODB_URI)
2. Drop existing data (development only)
3. Insert users
4. Insert tickets (reference user IDs)
5. Insert comments (reference ticket and user IDs)
6. Log summary counts
7. Disconnect
```

### Idempotency Strategy

**Development:** `deleteMany({})` on all three collections before insert. Simplest and fully predictable.

**Alternative (non-destructive):** Upsert users by `email`; skip tickets/comments if already seeded. More complex; not recommended for assessment.

---

## Record Counts

| Collection | Count | Detail File |
|------------|-------|-------------|
| users | 4 | [users.md](./users.md) |
| tickets | 8 | [tickets.md](./tickets.md) |
| comments | 6 | [comments.md](./comments.md) |

---

## Demo Credentials

> Document these in `README.md` after seed script is implemented.
> Passwords are for local development only — never use in production.

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | `Demo@1234` | admin |
| manager@demo.com | `Demo@1234` | manager |
| agent@demo.com | `Demo@1234` | agent |
| customer@demo.com | `Demo@1234` | customer |

**Core scope (no auth):** Users exist for `createdBy` / `assignedTo` references. Credentials used when stretch auth is implemented.

---

## Test Seed (Minimal)

Integration tests use a **separate minimal seed** in `tests/helpers/testSetup.js` — not the full demo seed.

| Collection | Test Count | Purpose |
|------------|-----------|---------|
| users | 2 | creator + assignee |
| tickets | 3 | open, in_progress, closed |
| comments | 1 | basic comment test |

Test seed runs in `beforeAll`; collections dropped in `afterAll`.

---

## Verification After Seed

```bash
mongosh ticket-management --eval "
  print('users:', db.users.countDocuments());
  print('tickets:', db.tickets.countDocuments());
  print('comments:', db.comments.countDocuments());
"
```

Expected output:
```
users: 4
tickets: 8
comments: 6
```

### Status Coverage Check

```bash
mongosh ticket-management --eval "
  db.tickets.aggregate([
    { \$group: { _id: '\$status', count: { \$sum: 1 } } },
    { \$sort: { _id: 1 } }
  ])
"
```

Expected: at least one document per status value.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [users.md](./users.md) | User seed records |
| [tickets.md](./tickets.md) | Ticket seed records |
| [comments.md](./comments.md) | Comment seed records |
| [../setup-notes.md](../setup-notes.md) | Database setup guide |
| [../schema/](../schema/) | Collection schema definitions |
