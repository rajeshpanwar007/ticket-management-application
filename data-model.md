# Data Model

> MongoDB schema design for the Support Ticket Management System.
> Detailed collection specs: [`database/schema/`](./database/schema/)
> Seed plan: [`database/seed-data/`](./database/seed-data/)
> Setup guide: [`database/setup-notes.md`](./database/setup-notes.md)

---

## Overview

The application uses **three core collections** in a single MongoDB database:

| Collection | Purpose | Document Count (seed) |
|------------|---------|----------------------|
| `users` | Ticket creators, assignees, and authenticated actors | 4 |
| `tickets` | Support requests with lifecycle status | 8 |
| `comments` | Append-only discussion threads on tickets | 6 |

**ODM:** Mongoose 8.x
**Database name (development):** `ticket-management`
**Database name (test):** `ticket-management-test`

### Design Principles

| Principle | Application |
|-----------|-------------|
| Normalization | Comments in a separate collection — not embedded in tickets |
| References over embedding | `ObjectId` refs with Mongoose `populate()` for reads |
| Application-level integrity | Foreign keys enforced in the service layer (MongoDB has no native FK constraints) |
| Schema as contract | Mongoose schemas define types, enums, defaults, and maxlength at the DB layer |
| Indexes for query patterns | Indexes match list, filter, search, and RBAC query paths |

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ _id             │◄──────────────────────────────┐
│ name            │                                │
│ email (unique)  │                                │
│ password        │                                │
│ role            │                                │
│ createdAt       │                                │
│ updatedAt       │                                │
└────────┬────────┘                                │
         │                                         │
         │ createdBy (required)                    │ assignedTo (optional)
         │                                         │
         ▼                                         │
┌─────────────────────────────────┐                │
│           tickets               │                │
│─────────────────────────────────│                │
│ _id                             │                │
│ title                           │                │
│ description                     │                │
│ status                          │                │
│ priority                        │                │
│ createdBy  ─────────────────────┘                │
│ assignedTo ──────────────────────────────────────┘
│ createdAt                       │
│ updatedAt                       │
└────────┬────────────────────────┘
         │
         │ ticketId (required)
         │
         ▼
┌─────────────────────────────────┐
│          comments               │
│─────────────────────────────────│
│ _id                             │
│ ticketId  ──────────────────────┘
│ authorId  ──────► users._id
│ body                            │
│ createdAt                       │
└─────────────────────────────────┘
```

### Cardinality

| Relationship | Cardinality | Notes |
|--------------|-------------|-------|
| User → Ticket (createdBy) | 1 : N | Every ticket has exactly one creator |
| User → Ticket (assignedTo) | 1 : N | A ticket may have zero or one assignee |
| Ticket → Comment | 1 : N | Comments cannot exist without a parent ticket |
| User → Comment (authorId) | 1 : N | Every comment has exactly one author |

---

## Collections Summary

### `users`

| Field | BSON Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | ObjectId | auto | auto | Primary key |
| `name` | String | yes | — | 1–100 chars |
| `email` | String | yes | — | Unique, lowercased |
| `password` | String | stretch | — | bcrypt hash; excluded from queries by default |
| `role` | String | stretch | `customer` | Enum: admin, manager, agent, customer |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

**Detail:** [`database/schema/users.md`](./database/schema/users.md)

---

### `tickets`

| Field | BSON Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | ObjectId | auto | auto | Primary key |
| `title` | String | yes | — | 1–200 chars |
| `description` | String | yes | — | 1–5000 chars |
| `status` | String | yes | `open` | Enum: open, in_progress, resolved, closed, cancelled |
| `priority` | String | yes | `medium` | Enum: low, medium, high |
| `createdBy` | ObjectId | yes | — | Ref → users |
| `assignedTo` | ObjectId | no | null | Ref → users; nullable |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

**Detail:** [`database/schema/tickets.md`](./database/schema/tickets.md)

---

### `comments`

| Field | BSON Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | ObjectId | auto | auto | Primary key |
| `ticketId` | ObjectId | yes | — | Ref → tickets |
| `authorId` | ObjectId | yes | — | Ref → users |
| `body` | String | yes | — | 1–2000 chars |
| `createdAt` | Date | auto | now | Append-only; no updatedAt |

**Detail:** [`database/schema/comments.md`](./database/schema/comments.md)

---

## Relationships

### Reference Fields

| Collection | Field | References | On Delete (application) |
|------------|-------|------------|------------------------|
| tickets | `createdBy` | users._id | Reject delete if tickets exist |
| tickets | `assignedTo` | users._id | Set to null if assignee deleted |
| comments | `ticketId` | tickets._id | Cascade delete comments with ticket (future) |
| comments | `authorId` | users._id | Preserve comment; authorId remains |

### Population Strategy

| Read Operation | Populate |
|----------------|----------|
| List tickets | `createdBy` (name, email), `assignedTo` (name, email) |
| Ticket detail | `createdBy`, `assignedTo`, comments with `authorId` |
| List users (stretch) | No population needed |

**Why populate on read, not embed:** User names can change; storing only ObjectId keeps tickets normalized.

---

## Indexes

### `users`

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `email_unique` | `{ email: 1 }` | Unique | Login lookup; prevent duplicates |
| `role_index` | `{ role: 1 }` | Standard | Filter users by role (stretch) |

### `tickets`

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `status_index` | `{ status: 1 }` | Standard | Status filter (AC-8) |
| `createdBy_index` | `{ createdBy: 1 }` | Standard | Customer own-tickets query (stretch RBAC) |
| `assignedTo_index` | `{ assignedTo: 1 }` | Sparse | Agent assigned-tickets query (stretch) |
| `ticket_text_search` | `{ title: "text", description: "text" }` | Text | Keyword search (AC-8) |
| `createdAt_index` | `{ createdAt: -1 }` | Standard | Default list sort (newest first) |

### `comments`

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `ticketId_index` | `{ ticketId: 1, createdAt: 1 }` | Compound | Fetch comment thread in chronological order |

**Full index rationale:** [`database/schema/README.md`](./database/schema/README.md)

---

## Validation Rules

Validation is enforced at three layers. Mongoose schema rules are the database contract; service layer handles business rules.

### Cross-Collection Rules (Service Layer)

| Rule | Enforced By | Error |
|------|-------------|-------|
| `createdBy` must reference existing user | ticket.service | 400 / 404 |
| `assignedTo` must reference existing user if provided | ticket.service | 400 / 404 |
| `assignedTo: null` clears assignment | ticket.service | — |
| `ticketId` must reference existing ticket | comment.service | 404 |
| `authorId` must reference existing user | comment.service | 400 |
| Status transitions follow state machine | ticket.service + domain | 409 |
| New tickets always start as `open` | ticket.service | — |
| `email` must be unique | Mongoose unique index | 400 |

### Field-Level Rules

| Collection | Field | Rules |
|------------|-------|-------|
| users | name | required, trim, 1–100 chars |
| users | email | required, trim, lowercase, valid email format, unique |
| users | password | required (stretch), min 8 chars before hash |
| users | role | enum: admin, manager, agent, customer |
| tickets | title | required, trim, 1–200 chars |
| tickets | description | required, trim, 1–5000 chars |
| tickets | status | enum, default open; transitions via state machine |
| tickets | priority | enum: low, medium, high; default medium |
| tickets | createdBy | required, valid ObjectId |
| tickets | assignedTo | optional, valid ObjectId or null |
| comments | body | required, trim, 1–2000 chars |
| comments | ticketId | required, valid ObjectId |
| comments | authorId | required, valid ObjectId |

**Per-collection detail:** [`database/schema/`](./database/schema/)

---

## Seed Data Strategy

### Goals

1. Provide demo-ready data covering all ticket statuses
2. Enable manual testing of search, filter, and state machine transitions
3. Support stretch RBAC with one user per role
4. Be idempotent — safe to run multiple times

### Seed Order

```
1. users      (no dependencies)
2. tickets    (requires users for createdBy / assignedTo)
3. comments   (requires tickets and users)
```

### Seed Counts

| Collection | Records | Notes |
|------------|---------|-------|
| users | 4 | admin, manager, agent, customer |
| tickets | 8 | At least one per status; extras for search testing |
| comments | 6 | Spread across 4 different tickets |

**Full seed specification:** [`database/seed-data/`](./database/seed-data/)

### Idempotency Strategy

The seed script uses **upsert by natural key**:
- Users: upsert by `email`
- Tickets: upsert by a seed-only `seedKey` field (removed from production queries) OR delete-and-reinsert in dev
- Comments: delete all seed comments and re-insert (keyed by ticket + author + body prefix)

**Recommended for assessment:** `deleteMany` on all three collections then insert fresh — simplest and fully predictable.

---

## Migration Strategy

### Approach

**Schema-on-read with Mongoose + seed script.** No formal migration framework (e.g., migrate-mongo) for assessment scope.

| Scenario | Strategy |
|----------|----------|
| Initial setup | Run seed script against empty database |
| Schema field added | Update Mongoose schema; existing docs get defaults on read |
| Index added | `syncIndexes()` on server startup (development) or manual `createIndex` |
| Breaking schema change | Drop collection and re-seed in development |
| Production (future) | Adopt migrate-mongo or Mongoose migration plugin |

### Versioning

No `schemaVersion` field in documents for core scope. Mongoose handles backward-compatible additions via defaults.

### Startup Sequence

```
1. Connect to MongoDB (MONGODB_URI)
2. Verify connection
3. syncIndexes() on all models (development only)
4. Start Express server
```

### Test Database

Integration tests use a separate database (`ticket-management-test`):
- `beforeAll`: connect, drop all collections, seed minimal data
- `afterAll`: drop all collections, disconnect

**Detail:** [`database/setup-notes.md`](./database/setup-notes.md)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | yes | — | Full MongoDB connection string |
| `MONGODB_DB_NAME` | no | `ticket-management` | Database name override |
| `MONGODB_TEST_URI` | test only | — | Test database URI (can append `/ticket-management-test`) |
| `NODE_ENV` | no | `development` | Controls index sync and logging verbosity |

### Connection String Examples

| Environment | Example |
|-------------|---------|
| Local | `mongodb://localhost:27017/ticket-management` |
| Atlas | `mongodb+srv://<user>:<password>@cluster.mongodb.net/ticket-management` |
| Test | `mongodb://localhost:27017/ticket-management-test` |

### Security Rules

- Never commit real `MONGODB_URI` values to git
- Use `.env` locally; document placeholders in `.env.example`
- Atlas: restrict IP whitelist; use dedicated DB user with read/write on one database only

---

## Query Patterns

| Use Case | Collection | Query | Index Used |
|----------|------------|-------|------------|
| List all tickets (default) | tickets | `{}` sort `{ createdAt: -1 }` | createdAt_index |
| Filter by status | tickets | `{ status: ? }` | status_index |
| Keyword search | tickets | `$text: { $search: ? }` | ticket_text_search |
| Search + filter | tickets | `{ status: ?, $text: ... }` | Both |
| Customer own tickets (stretch) | tickets | `{ createdBy: userId }` | createdBy_index |
| Agent assigned tickets (stretch) | tickets | `{ assignedTo: userId }` | assignedTo_index |
| Ticket detail | tickets | `{ _id: id }` + populate | _id (default) |
| Comment thread | comments | `{ ticketId: id }` sort `{ createdAt: 1 }` | ticketId_index |
| Login (stretch) | users | `{ email: ? }` | email_unique |
| List users for assignee dropdown | users | `{}` select name, email, role | — |

---

## Data Lifecycle

| Entity | Create | Update | Delete |
|--------|--------|--------|--------|
| User | stretch: admin | stretch: admin | not in core scope |
| Ticket | POST /api/tickets | PATCH /api/tickets/:id | not in core scope |
| Comment | POST comments | not allowed (append-only) | not in core scope |

**Why no delete in core:** Assessment focuses on lifecycle management via status transitions, not deletion.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [`database/setup-notes.md`](./database/setup-notes.md) | Installation, connection, env setup |
| [`database/schema/`](./database/schema/) | Per-collection field and index specs |
| [`database/seed-data/`](./database/seed-data/) | Seed record definitions |
| [`design-notes.md`](./design-notes.md) | Full system architecture |
| [`api-contract.md`](./api-contract.md) | API request/response shapes |
