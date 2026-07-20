# Collection: tickets

> Core entity. Stores support requests with governed lifecycle status.

---

## Collection Name

`tickets`

## Model File

`server/src/models/ticket.model.js`

---

## Fields

| Field | BSON Type | Required | Default | Constraints |
|-------|-----------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | Primary key |
| `title` | String | yes | — | trim, minlength 1, maxlength 200 |
| `description` | String | yes | — | trim, minlength 1, maxlength 5000 |
| `status` | String | yes | `open` | enum (see below) |
| `priority` | String | yes | `medium` | enum: `low`, `medium`, `high` |
| `createdBy` | ObjectId | yes | — | ref: `User` |
| `assignedTo` | ObjectId | no | `null` | ref: `User`; nullable |
| `createdAt` | Date | auto | `Date.now` | `timestamps: true` |
| `updatedAt` | Date | auto | `Date.now` | `timestamps: true` |

---

## Status Enum

| Value | Terminal | Description |
|-------|----------|-------------|
| `open` | no | Newly created; awaiting action |
| `in_progress` | no | Being actively worked |
| `resolved` | no | Fix provided; awaiting closure |
| `closed` | **yes** | Successfully completed |
| `cancelled` | **yes** | Closed without resolution |

### State Machine (enforced in service layer)

| From | Allowed To |
|------|------------|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `resolved` |
| `resolved` | `closed` |
| `closed` | — |
| `cancelled` | — |

Status transitions are **not** validated by Mongoose enum alone — the service layer calls `canTransition(from, to)` from `domain/statusMachine.js`. Invalid transitions return HTTP 409.

---

## Priority Enum

| Value | Description |
|-------|-------------|
| `low` | Non-urgent |
| `medium` | Standard (default) |
| `high` | Urgent |

---

## Indexes

| Name | Definition | Options | Purpose |
|------|------------|---------|---------|
| `_id_` | `{ _id: 1 }` | default | Primary key |
| `status_index` | `{ status: 1 }` | — | `GET /api/tickets?status=open` |
| `createdBy_index` | `{ createdBy: 1 }` | — | Customer own-tickets filter (stretch RBAC) |
| `assignedTo_index` | `{ assignedTo: 1 }` | `sparse: true` | Agent assigned-tickets filter (stretch) |
| `ticket_text_search` | `{ title: "text", description: "text" }` | `default_language: "english"` | `GET /api/tickets?search=keyword` |
| `createdAt_index` | `{ createdAt: -1 }` | — | Default list sort: newest first |

### Index Design Notes

- **Sparse on `assignedTo`:** Many tickets have no assignee (`null`). Sparse index excludes nulls, keeping index size small.
- **Text index:** Supports `$text` search across title and description. Fallback: case-insensitive regex if text index setup fails.
- **Compound not needed for search+filter:** MongoDB query planner uses `status_index` + `ticket_text_search` together via index intersection.

---

## Validation Rules

### Mongoose Schema

| Field | Validators |
|-------|-----------|
| title | `required`, `trim`, `minlength: 1`, `maxlength: 200` |
| description | `required`, `trim`, `minlength: 1`, `maxlength: 5000` |
| status | `enum: ['open','in_progress','resolved','closed','cancelled']`, `default: 'open'` |
| priority | `enum: ['low','medium','high']`, `default: 'medium'` |
| createdBy | `required`, `ref: 'User'` |
| assignedTo | `ref: 'User'`, `default: null` |

### Service Layer

| Rule | Error |
|------|-------|
| `createdBy` must reference existing user | 404 `NOT_FOUND` |
| `assignedTo` must reference existing user if not null | 404 `NOT_FOUND` |
| `assignedTo: null` clears assignment | — |
| New tickets always created with `status: 'open'` | — (ignore status in POST body) |
| Status change must pass `canTransition(from, to)` | 409 `INVALID_TRANSITION` |
| Same-status PATCH is a no-op | 200, no DB write |
| Customer can only access own tickets (stretch) | 403 `FORBIDDEN` |

### Middleware (Request)

| Field | Rule |
|-------|------|
| title | required on POST; string; 1–200 chars on PATCH |
| description | required on POST; string; 1–5000 chars on PATCH |
| priority | optional; must be valid enum |
| status | optional; must be valid enum |
| assignedTo | optional; valid ObjectId or null |

---

## Relationships

| Direction | Relationship | Field |
|-----------|-------------|-------|
| Ticket → User | Many tickets created by one user | `createdBy` |
| Ticket → User | Many tickets assigned to one user (optional) | `assignedTo` |
| Ticket → Comment | One ticket has many comments | `comments.ticketId` |

### Population on Read

| Endpoint | Populate |
|----------|----------|
| GET /api/tickets | `createdBy` (name, email), `assignedTo` (name, email) |
| GET /api/tickets/:id | `createdBy`, `assignedTo`, comments with `authorId` (name, email) |

---

## Query Patterns

| Use Case | Filter | Sort | Index |
|----------|--------|------|-------|
| List all | `{}` | `{ createdAt: -1 }` | createdAt_index |
| Filter by status | `{ status: value }` | `{ createdAt: -1 }` | status_index |
| Keyword search | `{ $text: { $search: term } }` | score | ticket_text_search |
| Search + status | `{ status, $text }` | score | both |
| Own tickets (stretch) | `{ createdBy: userId }` | `{ createdAt: -1 }` | createdBy_index |
| Assigned tickets (stretch) | `{ assignedTo: userId }` | `{ createdAt: -1 }` | assignedTo_index |
| Detail by ID | `{ _id: id }` | — | _id_ |

---

## API Response Shape

```json
{
  "_id": "...",
  "title": "Cannot login to account",
  "description": "Getting 401 error since yesterday...",
  "status": "open",
  "priority": "high",
  "createdBy": {
    "_id": "...",
    "name": "Alice Customer",
    "email": "customer@demo.com"
  },
  "assignedTo": {
    "_id": "...",
    "name": "Bob Agent",
    "email": "agent@demo.com"
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

---

## Design Notes

- **No `deletedAt` / soft delete** — ticket deletion out of core scope
- **No version field** — concurrent update conflicts use last-write-wins; document as limitation
- **No audit log collection** — status history not tracked in core scope
- **Status not settable on create** — always defaults to `open`; prevents bypassing state machine
