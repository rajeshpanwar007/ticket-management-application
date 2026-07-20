# Database Schema

> Per-collection MongoDB schema specifications for the Support Ticket Management System.
> Implementation: Mongoose models in `server/src/models/`.

---

## Collections

| Collection | Model File | Description |
|------------|------------|-------------|
| [`users`](./users.md) | `user.model.js` | System actors — creators, assignees, commenters |
| [`tickets`](./tickets.md) | `ticket.model.js` | Support requests with lifecycle status |
| [`comments`](./comments.md) | `comment.model.js` | Append-only messages on tickets |

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Three collections, normalized | Comments grow independently; avoids document size limits |
| ObjectId references | Enables population; keeps documents lean |
| No embedded user snapshots | User name/email fetched via populate; stays current if user updated |
| camelCase field names | Consistent with JavaScript conventions and API JSON |
| snake_case enum values | `in_progress` matches API contract and state machine |
| Timestamps on all collections | `createdAt` on all; `updatedAt` on users and tickets only |
| Append-only comments | No `updatedAt` on comments; edit/delete out of core scope |
| Sparse index on `assignedTo` | Efficient indexing when many tickets are unassigned |

---

## Relationships

```
users ──< tickets.createdBy
users ──< tickets.assignedTo  (optional)
users ──< comments.authorId
tickets ──< comments.ticketId
```

### Referential Integrity (Application Layer)

| Rule | Layer | On Violation |
|------|-------|-------------|
| `createdBy` references valid user | ticket.service | 400 / 404 |
| `assignedTo` references valid user or is null | ticket.service | 400 / 404 |
| `ticketId` references valid ticket | comment.service | 404 |
| `authorId` references valid user | comment.service | 400 |
| `email` is unique | Mongoose unique index | 400 E11000 |

MongoDB does not enforce foreign keys. All referential checks happen in the service layer before `save()`.

---

## Index Summary

| Collection | Index Name | Definition | Purpose |
|------------|------------|------------|---------|
| users | `email_unique` | `{ email: 1 }` unique | Login, duplicate prevention |
| users | `role_index` | `{ role: 1 }` | Role-based queries (stretch) |
| tickets | `status_index` | `{ status: 1 }` | Status filter |
| tickets | `createdBy_index` | `{ createdBy: 1 }` | Own-tickets RBAC query |
| tickets | `assignedTo_index` | `{ assignedTo: 1 }` sparse | Assigned-tickets query |
| tickets | `ticket_text_search` | `{ title: "text", description: "text" }` | Keyword search |
| tickets | `createdAt_index` | `{ createdAt: -1 }` | Default list sort |
| comments | `ticketId_createdAt` | `{ ticketId: 1, createdAt: 1 }` | Thread fetch in order |

---

## Validation Summary

| Layer | Responsibility |
|-------|---------------|
| Mongoose schema | Types, required, enum, maxlength, trim, lowercase |
| express-validator middleware | Request body shape before service |
| Service layer | Business rules, refs, state machine |
| Unique index | Email uniqueness (last resort) |

---

## Collection Documents

- [users.md](./users.md)
- [tickets.md](./tickets.md)
- [comments.md](./comments.md)
