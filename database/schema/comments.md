# Collection: comments

> Append-only message thread on a support ticket.

---

## Collection Name

`comments`

## Model File

`server/src/models/comment.model.js`

---

## Fields

| Field | BSON Type | Required | Default | Constraints |
|-------|-----------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | Primary key |
| `ticketId` | ObjectId | yes | — | ref: `Ticket` |
| `authorId` | ObjectId | yes | — | ref: `User` |
| `body` | String | yes | — | trim, minlength 1, maxlength 2000 |
| `createdAt` | Date | auto | `Date.now` | Immutable; no `updatedAt` |

---

## Indexes

| Name | Definition | Options | Purpose |
|------|------------|---------|---------|
| `_id_` | `{ _id: 1 }` | default | Primary key |
| `ticketId_createdAt` | `{ ticketId: 1, createdAt: 1 }` | — | Fetch thread in chronological order |

### Index Design Notes

- **Compound `ticketId + createdAt`:** Supports `find({ ticketId }).sort({ createdAt: 1 })` as a covered query pattern.
- **No index on `authorId` alone:** Comments are always fetched via ticket; author is populated, not queried directly.

---

## Validation Rules

### Mongoose Schema

| Field | Validators |
|-------|-----------|
| ticketId | `required`, `ref: 'Ticket'` |
| authorId | `required`, `ref: 'User'` |
| body | `required`, `trim`, `minlength: 1`, `maxlength: 2000` |
| createdAt | `default: Date.now`; no `updatedAt` (append-only) |

### Service Layer

| Rule | Error |
|------|-------|
| `ticketId` must reference existing ticket | 404 `NOT_FOUND` |
| `authorId` must reference existing user | 400 / 404 |
| `body` must be non-empty after trim | 400 `VALIDATION_ERROR` |
| Comments allowed on tickets in any status (including terminal) | — |
| Customer can only comment on own tickets (stretch) | 403 `FORBIDDEN` |

### Middleware (Request)

| Field | Rule |
|-------|------|
| body | required; string; 1–2000 chars |

---

## Relationships

| Direction | Relationship | Field |
|-----------|-------------|-------|
| Comment → Ticket | Many comments belong to one ticket | `ticketId` |
| Comment → User | Many comments authored by one user | `authorId` |

---

## Query Patterns

| Use Case | Query | Sort | Index |
|----------|-------|------|-------|
| Thread for ticket | `{ ticketId: id }` | `{ createdAt: 1 }` | ticketId_createdAt |
| Count for ticket | `{ ticketId: id }` | — | ticketId_createdAt |

Comments are fetched as part of ticket detail (`GET /api/tickets/:id`), not via a separate list endpoint.

---

## API Response Shape

```json
{
  "_id": "...",
  "ticketId": "...",
  "authorId": {
    "_id": "...",
    "name": "Bob Agent",
    "email": "agent@demo.com"
  },
  "body": "I've reset your session token. Please try again.",
  "createdAt": "2026-01-15T11:30:00.000Z"
}
```

---

## Design Notes

| Decision | Rationale |
|----------|-----------|
| Separate collection (not embedded) | Comments grow over time; embedding would bloat ticket documents toward 16MB limit |
| Append-only | Edit/delete out of core scope; simplifies data model and UI |
| No `updatedAt` | Signals immutability; no edit endpoint in core |
| Allowed on terminal tickets | Users may add closing notes even after ticket is closed/cancelled |
| `authorId` not denormalized | Author name fetched via populate; stays current if user renamed |
| No pagination on thread | Assessment scale (few comments per ticket) does not require it |

---

## Future Considerations (Out of Scope)

- Edit comment within 5-minute window
- Soft delete with `deletedAt`
- Internal vs public comment flag (agent-only notes)
- Cascade delete comments when ticket is deleted
